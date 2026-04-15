import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FunerariaService } from '../../services/funeraria.service';
import { FavoritoService } from '../../services/favorito.service';
import { AuthService } from '../../services/auth.service';
import { Funeraria } from '../../models/funeraria.model';
import { Review } from '../../models/review.model';
import { Servico } from '../../models/servico.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-funeral-home-details',
  standalone: true,
  imports: [HeaderComponent, RouterModule, CommonModule],
  templateUrl: './funeral-home-details.html',
  styleUrl: './funeral-home-details.css',
})
export class FuneralHomeDetails implements OnInit, AfterViewInit {
  private map: L.Map | null = null;
  private mapReady = false;
  funeraria: Funeraria | null = null;
  servicos: Servico[] = [];
  reviews: Review[] = [];
  loading = true;
  error: string | null = null;
  funerariaId: number = 0;
  isFavorited = false;
  favoritoId: number | null = null;
  favMessage = '';

  constructor(
    private funerariaService: FunerariaService,
    private favoritoService: FavoritoService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.funerariaId = idParam ? Number(idParam) : 0;
    if (this.funerariaId) {
      this.loadFuneraria();
      if (this.authService.isLoggedIn && this.authService.isUsuario) {
        this.checkFavorite();
      }
    }
  }

  loadFuneraria(): void {
    this.funerariaService.getFunerariaById(this.funerariaId).subscribe({
      next: (data) => {
        this.funeraria = data;
        this.servicos = data.servicos || [];
        this.reviews = data.reviews || [];
        this.loading = false;
        this.cdr.detectChanges();
        if (this.mapReady) {
          setTimeout(() => this.initMap(), 50);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar funerária:', err);
        this.error = err.message || 'Erro ao carregar dados';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  checkFavorite(): void {
    this.favoritoService.getAll().subscribe({
      next: (data) => {
        const userId = this.authService.userId;
        const fav = data.find(f => f.usuarioId === userId && f.funerariaId === this.funerariaId);
        if (fav) {
          this.isFavorited = true;
          this.favoritoId = fav.id;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao verificar favorito:', err);
      }
    });
  }

  toggleFavorite(): void {
    if (!this.authService.isLoggedIn || !this.authService.isUsuario) return;

    if (this.isFavorited && this.favoritoId) {
      this.favoritoService.deleteFavorito(this.favoritoId).subscribe({
        next: () => {
          this.isFavorited = false;
          this.favoritoId = null;
          this.favMessage = 'Removido dos favoritos';
          this.cdr.detectChanges();
          setTimeout(() => { this.favMessage = ''; this.cdr.detectChanges(); }, 2000);
        },
        error: (err) => {
          console.error('Erro ao remover favorito:', err);
          this.favMessage = 'Erro ao remover favorito';
          this.cdr.detectChanges();
          setTimeout(() => { this.favMessage = ''; this.cdr.detectChanges(); }, 3000);
        }
      });
    } else {
      const payload = {
        usuarioId: this.authService.userId!,
        funerariaId: this.funerariaId
      };
      this.favoritoService.create(payload).subscribe({
        next: (fav) => {
          this.isFavorited = true;
          this.favoritoId = fav.id;
          this.favMessage = 'Adicionado aos favoritos!';
          this.cdr.detectChanges();
          setTimeout(() => { this.favMessage = ''; this.cdr.detectChanges(); }, 2000);
        },
        error: (err) => {
          console.error('Erro ao adicionar favorito:', err);
          this.favMessage = 'Erro ao adicionar favorito';
          this.cdr.detectChanges();
          setTimeout(() => { this.favMessage = ''; this.cdr.detectChanges(); }, 3000);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.mapReady = true;
    if (this.funeraria) {
      this.initMap();
    }
  }

  private initMap(): void {
    if (!this.funeraria || this.map) return;

    const mapEl = document.getElementById('leaflet-map');
    if (!mapEl) return;

    const hasCoords = this.funeraria.latitude != null && this.funeraria.longitude != null;

    // Fix ícone padrão do Leaflet (bug conhecido com bundlers)
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    if (hasCoords) {
      // Funerária tem coordenadas cadastradas — exibe direto
      const lat = this.funeraria.latitude!;
      const lng = this.funeraria.longitude!;
      this.map = L.map('leaflet-map').setView([lat, lng], 15);
      this.addTileLayer();
      L.marker([lat, lng], { icon: defaultIcon })
        .addTo(this.map)
        .bindPopup(`<strong>${this.funeraria.nome}</strong><br>${this.funeraria.endereco || this.funeraria.cidade}`)
        .openPopup();
      setTimeout(() => this.map?.invalidateSize(), 100);
    } else {
      // Sem coordenadas — tenta geocodificar pelo endereço/cidade via Nominatim (OpenStreetMap)
      const query = this.funeraria.endereco
        ? `${this.funeraria.endereco}, ${this.funeraria.cidade}, ${this.funeraria.estado || 'Brasil'}`
        : `${this.funeraria.cidade}, ${this.funeraria.estado || 'Brasil'}`;

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
        .then(res => res.json())
        .then((results: any[]) => {
          let lat = -19.9191;  // fallback BH
          let lng = -43.9386;
          let zoom = 12;

          if (results && results.length > 0) {
            lat = parseFloat(results[0].lat);
            lng = parseFloat(results[0].lon);
            zoom = 15;
          }

          this.map = L.map('leaflet-map').setView([lat, lng], zoom);
          this.addTileLayer();
          L.marker([lat, lng], { icon: defaultIcon })
            .addTo(this.map!)
            .bindPopup(`<strong>${this.funeraria!.nome}</strong><br>${this.funeraria!.endereco || this.funeraria!.cidade}`)
            .openPopup();
          setTimeout(() => this.map?.invalidateSize(), 100);
        })
        .catch(() => {
          // Geocoding falhou — mostra mapa na posição padrão
          this.map = L.map('leaflet-map').setView([-19.9191, -43.9386], 12);
          this.addTileLayer();
          setTimeout(() => this.map?.invalidateSize(), 100);
        });
    }
  }

  private addTileLayer(): void {
    if (!this.map) return;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
  }

  getAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.nota, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }
}
