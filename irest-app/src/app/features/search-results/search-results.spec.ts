import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SearchResults } from './search-results';

describe('SearchResults', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResults],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('deve ser criado', () => {
    const fixture = TestBed.createComponent(SearchResults);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve iniciar com lista vazia de funerárias', () => {
    const fixture = TestBed.createComponent(SearchResults);
    expect(fixture.componentInstance.funerarias.length).toBe(0);
  });

  it('deve iniciar sem filtros selecionados', () => {
    const fixture = TestBed.createComponent(SearchResults);
    const comp = fixture.componentInstance;
    expect(comp.cidadeSelecionada).toBe('');
    expect(comp.precoMin).toBeNull();
    expect(comp.precoMax).toBeNull();
  });
});
