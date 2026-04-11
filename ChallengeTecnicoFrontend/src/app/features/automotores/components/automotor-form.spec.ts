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

    component.confirmSubmit();

    expect(saveSpy).toHaveBeenCalledWith({
      dominio: 'AA123BB',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });
  });

  it('muestra chasis y motor en el modal de confirmacion', async () => {
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
      cuitTitular: '20123456786',
    });

    component.onSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dialog = compiled.querySelector<HTMLElement>('#automotor-create-confirmation-dialog');

    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Chasis');
    expect(dialog?.textContent).toContain('CH-001');
    expect(dialog?.textContent).toContain('Motor');
    expect(dialog?.textContent).toContain('MO-001');
  });

  it('abre confirmacion en modo edicion antes de emitir el draft', async () => {
    await TestBed.configureTestingModule({
      imports: [AutomotorForm],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotorForm);
    fixture.componentRef.setInput('mode', 'edit');
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

    component.confirmSubmit();

    expect(saveSpy).toHaveBeenCalledWith({
      dominio: 'AA123BB',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });
  });

  it('mantiene dominio readonly en modo edicion con helper accesible', async () => {
    await TestBed.configureTestingModule({
      imports: [AutomotorForm],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotorForm);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialDraft', {
      dominio: 'AA123BB',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dominioInput = compiled.querySelector<HTMLInputElement>('#automotor-form-dominio');
    const helper = compiled.querySelector<HTMLElement>('#automotor-form-dominio-helper');

    expect(dominioInput?.readOnly).toBe(true);
    expect(dominioInput?.getAttribute('aria-describedby')).toContain(
      'automotor-form-dominio-helper',
    );
    expect(helper?.textContent).toContain(
      'El dominio es identificador del registro y no puede modificarse.',
    );
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
    expect(dominioInput?.getAttribute('aria-describedby')).toContain('automotor-form-dominio-format');
    expect(dominioInput?.getAttribute('aria-describedby')).toContain('automotor-form-dominio-error');
    expect(dominioError?.textContent).toContain('Este campo es obligatorio.');
  });
});
