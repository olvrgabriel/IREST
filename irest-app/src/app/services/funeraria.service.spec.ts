import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FunerariaService } from './funeraria.service';

describe('FunerariaService', () => {
  let service: FunerariaService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:5019/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FunerariaService
      ]
    });

    service = TestBed.inject(FunerariaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve buscar todas as funerárias', () => {
    const mockFunerarias = [
      { id: 1, nome: 'Funerária A', cidade: 'SP', estado: 'SP', reviews: [], servicos: [], favoritos: [] },
      { id: 2, nome: 'Funerária B', cidade: 'RJ', estado: 'RJ', reviews: [], servicos: [], favoritos: [] }
    ];

    service.getAll().subscribe(data => {
      expect(data.length).toBe(2);
      expect(data[0].nome).toBe('Funerária A');
      expect(data[1].cidade).toBe('RJ');
    });

    const req = httpMock.expectOne(`${apiUrl}/Funerarias`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFunerarias);
  });

  it('deve buscar funerária por ID', () => {
    const mockFuneraria = {
      id: 3,
      nome: 'Funerária Central',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      telefone: '31999999999',
      endereco: 'Rua Teste, 123',
      reviews: [{ id: 1, nota: 5, comentario: 'Ótimo', usuarioNome: 'João' }],
      servicos: [{ id: 1, nome: 'Cremação', preco: 500 }],
      favoritos: []
    };

    service.getFunerariaById(3).subscribe(data => {
      expect(data.id).toBe(3);
      expect(data.nome).toBe('Funerária Central');
      expect(data.reviews.length).toBe(1);
      expect(data.servicos.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/Funerarias/3`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFuneraria);
  });

  it('deve criar funerária', () => {
    const novaFuneraria = { nome: 'Funerária Nova', cidade: 'Campinas', estado: 'SP' };
    const mockResponse = { id: 10, ...novaFuneraria, reviews: [], servicos: [], favoritos: [] };

    service.create(novaFuneraria).subscribe(data => {
      expect(data.id).toBe(10);
      expect(data.nome).toBe('Funerária Nova');
    });

    const req = httpMock.expectOne(`${apiUrl}/Funerarias`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nome).toBe('Funerária Nova');
    req.flush(mockResponse);
  });

  it('deve deletar funerária', () => {
    service.deleteFuneraria(5).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/Funerarias/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush('');
  });

  it('deve calcular média de avaliações corretamente', () => {
    const funeraria: any = {
      reviews: [
        { nota: 5 },
        { nota: 4 },
        { nota: 3 }
      ]
    };

    const avg = service.getAverageRating(funeraria);
    expect(avg).toBe(4);
  });

  it('deve retornar 0 quando sem avaliações', () => {
    const funeraria: any = { reviews: [] };
    expect(service.getAverageRating(funeraria)).toBe(0);
  });

  it('deve retornar 0 quando reviews é null', () => {
    const funeraria: any = { reviews: null };
    expect(service.getAverageRating(funeraria)).toBe(0);
  });

  it('deve tratar erro de conexão', () => {
    service.getAll().subscribe({
      error: (err) => {
        expect(err.message).toContain('conectar ao servidor');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/Funerarias`);
    req.error(new ProgressEvent('error'), { status: 0 });
  });

  it('deve tratar erro 404', () => {
    service.getFunerariaById(999).subscribe({
      error: (err) => {
        expect(err.message).toContain('404');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/Funerarias/999`);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
