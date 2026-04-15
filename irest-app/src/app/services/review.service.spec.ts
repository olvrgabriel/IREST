import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReviewService } from './review.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:5019/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ReviewService
      ]
    });

    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve buscar todas as avaliações', () => {
    const mockReviews = [
      { id: 1, nota: 5, comentario: 'Excelente', usuarioId: 1, funerariaId: 1 },
      { id: 2, nota: 3, comentario: 'Regular', usuarioId: 2, funerariaId: 1 }
    ];

    service.getAll().subscribe(data => {
      expect(data.length).toBe(2);
      expect(data[0].nota).toBe(5);
    });

    const req = httpMock.expectOne(`${apiUrl}/Reviews`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReviews);
  });

  it('deve buscar avaliação por ID', () => {
    const mockReview = { id: 1, nota: 4, comentario: 'Bom', usuarioId: 1, funerariaId: 3 };

    service.getReviewById(1).subscribe(data => {
      expect(data.id).toBe(1);
      expect(data.nota).toBe(4);
    });

    const req = httpMock.expectOne(`${apiUrl}/Reviews/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReview);
  });

  it('deve criar avaliação com dados corretos', () => {
    const payload = { nota: 5, comentario: 'Perfeito', usuarioId: 1, funerariaId: 3 };
    const mockResponse = { id: 10, ...payload, dataAvaliacao: new Date().toISOString() };

    service.create(payload).subscribe(data => {
      expect(data.id).toBe(10);
      expect(data.nota).toBe(5);
    });

    const req = httpMock.expectOne(`${apiUrl}/Reviews`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nota).toBe(5);
    expect(req.request.body.funerariaId).toBe(3);
    req.flush(mockResponse);
  });

  it('deve deletar avaliação', () => {
    service.deleteReview(5).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/Reviews/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush('');
  });

  it('deve retornar erro ao buscar avaliação inexistente', () => {
    service.getReviewById(999).subscribe({
      error: (err) => {
        expect(err.message).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/Reviews/999`);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('deve enviar nota como número no payload', () => {
    service.create({ nota: 3, comentario: 'Ok', usuarioId: 1, funerariaId: 1 }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/Reviews`);
    expect(typeof req.request.body.nota).toBe('number');
    req.flush({ id: 1 });
  });
});
