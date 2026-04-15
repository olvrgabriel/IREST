import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HeaderComponent } from './header';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('deve ser criado', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve mostrar menu fechado por padrão', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.menuOpen).toBe(false);
  });

  it('deve alternar menu ao chamar toggleMenu', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const comp = fixture.componentInstance;

    comp.toggleMenu();
    expect(comp.menuOpen).toBe(true);

    comp.toggleMenu();
    expect(comp.menuOpen).toBe(false);
  });

  it('deve estar deslogado quando não há usuário', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.isLoggedIn).toBe(false);
  });

  it('deve retornar isAdmin false quando deslogado', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.isAdmin).toBe(false);
  });
});
