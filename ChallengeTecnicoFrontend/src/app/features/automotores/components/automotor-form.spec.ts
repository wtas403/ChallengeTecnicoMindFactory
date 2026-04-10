import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AutomotorForm } from './automotor-form';

describe('AutomotorForm', () => {
  it('marca error cuando el CUIT es invalido', async () => {
    await TestBed.configureTestingModule({
      imports: [AutomotorForm],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotorForm);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.form.setValue({
      dominio: 'AA123BB',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20111111111',
    });

    component.form.controls.cuitTitular.markAsTouched();
    fixture.detectChanges();

    expect(component.controlError('cuitTitular')).toBe('El CUIT ingresado no es valido.');
  });

  it('abre confirmacion en alta antes de emitir el draft', async () => {
    await TestBed.configureTestingModule({
      imports: [AutomotorForm],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotorForm);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const saveSpy = vi.spyOn(component.save, 'emit');

    component.form.setValue({
      dominio: 'aa123bb',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20-12345678-6',
    });

    component.onSubmit();

    expect(saveSpy).not.toHaveBeenCalled();
    expect(component.isConfirmDialogOpen()).toBe(true);

    component.confirmCreate();

    expect(saveSpy).toHaveBeenCalledWith({
      dominio: 'AA123BB',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });
  });

  it('emite draft directamente en modo edicion', async () => {
    await TestBed.configureTestingModule({
      imports: [AutomotorForm],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotorForm);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const saveSpy = vi.spyOn(component.save, 'emit');

    component.form.controls.dominio.enable();
    component.form.setValue({
      dominio: 'aa123bb',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20-12345678-6',
    });

    component.onSubmit();

    expect(component.isConfirmDialogOpen()).toBe(false);
    expect(saveSpy).toHaveBeenCalledWith({
      dominio: 'AA123BB',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });
  });

  it('expone ids y atributos aria en errores de campo', async () => {
    await TestBed.configureTestingModule({
      imports: [AutomotorForm],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotorForm);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.form.controls.dominio.markAsTouched();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dominioInput = compiled.querySelector<HTMLInputElement>('#automotor-form-dominio');
    const dominioError = compiled.querySelector<HTMLElement>('#automotor-form-dominio-error');

    expect(dominioInput).not.toBeNull();
    expect(dominioInput?.getAttribute('aria-invalid')).toBe('true');
    expect(dominioInput?.getAttribute('aria-describedby')).toBe('automotor-form-dominio-error');
    expect(dominioError?.textContent).toContain('Este campo es obligatorio.');
  });
});
