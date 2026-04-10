import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CrearTitularInline } from './crear-titular-inline';

describe('CrearTitularInline', () => {
  it('requiere nombre completo para emitir create', async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTitularInline],
    }).compileComponents();

    const fixture = TestBed.createComponent(CrearTitularInline);
    fixture.componentRef.setInput('cuit', '20123456786');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const emitSpy = vi.spyOn(component.create, 'emit');

    component.onCreate();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.controls.nombreCompleto.hasError('required')).toBe(true);
  });

  it('emite create con nombre normalizado', async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTitularInline],
    }).compileComponents();

    const fixture = TestBed.createComponent(CrearTitularInline);
    fixture.componentRef.setInput('cuit', '20123456786');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const emitSpy = vi.spyOn(component.create, 'emit');

    component.form.controls.nombreCompleto.setValue('  Juan Perez  ');
    component.onCreate();

    expect(emitSpy).toHaveBeenCalledWith('Juan Perez');
  });

  it('expone ids y atributos aria para el campo nombre completo', async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTitularInline],
    }).compileComponents();

    const fixture = TestBed.createComponent(CrearTitularInline);
    fixture.componentRef.setInput('cuit', '20123456786');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.form.controls.nombreCompleto.markAsTouched();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nombreInput = compiled.querySelector<HTMLInputElement>('#titular-inline-nombre-completo');

    expect(nombreInput).not.toBeNull();
    expect(nombreInput?.getAttribute('aria-invalid')).toBe('true');
    expect(nombreInput?.getAttribute('aria-describedby')).toBe(
      'titular-inline-nombre-completo-error',
    );
  });
});
