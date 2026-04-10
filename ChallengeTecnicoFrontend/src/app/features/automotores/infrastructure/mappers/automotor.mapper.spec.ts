import { describe, expect, it } from 'vitest';
import { Automotor } from '../../domain/models/automotor';
import { AutomotorDraft } from '../../domain/models/automotor-draft';
import {
  mapAutomotorDtoToAutomotor,
  mapAutomotorDraftToCreateAutomotorDto,
  mapAutomotorDraftToUpdateAutomotorDto,
  mapAutomotorToDraft,
} from './automotor.mapper';

describe('automotor.mapper', () => {
  const automotor: Automotor = {
    dominio: 'AA123BB',
    chasis: 'CHASIS123',
    motor: 'MOTOR123',
    color: 'Negro',
    fechaFabricacion: '202401',
    titular: {
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    },
  };

  const automotorDraft: AutomotorDraft = {
    dominio: 'AA123BB',
    chasis: 'CHASIS123',
    motor: 'MOTOR123',
    color: 'Negro',
    fechaFabricacion: '202401',
    cuitTitular: '20123456786',
  };

  it('mapea AutomotorDto a Automotor', () => {
    expect(
      mapAutomotorDtoToAutomotor({
        dominio: 'AA123BB',
        chasis: 'CHASIS123',
        motor: 'MOTOR123',
        color: 'Negro',
        fechaFabricacion: '202401',
        sujeto: {
          cuit: '20123456786',
          nombreCompleto: 'Juan Perez',
        },
      }),
    ).toEqual(automotor);
  });

  it('mapea Automotor a AutomotorDraft', () => {
    expect(mapAutomotorToDraft(automotor)).toEqual(automotorDraft);
  });

  it('mapea AutomotorDraft a CreateAutomotorDto', () => {
    expect(mapAutomotorDraftToCreateAutomotorDto(automotorDraft)).toEqual({
      dominio: 'AA123BB',
      chasis: 'CHASIS123',
      motor: 'MOTOR123',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });
  });

  it('incluye nombreTitular opcional al mapear create/update', () => {
    const draftConNombreTitular = {
      ...automotorDraft,
      nombreTitular: 'Ana Torres',
    };

    expect(mapAutomotorDraftToCreateAutomotorDto(draftConNombreTitular)).toEqual({
      dominio: 'AA123BB',
      chasis: 'CHASIS123',
      motor: 'MOTOR123',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
      nombreTitular: 'Ana Torres',
    });

    expect(mapAutomotorDraftToUpdateAutomotorDto(draftConNombreTitular)).toEqual({
      chasis: 'CHASIS123',
      motor: 'MOTOR123',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
      nombreTitular: 'Ana Torres',
    });
  });

  it('mapea AutomotorDraft a UpdateAutomotorDto', () => {
    expect(mapAutomotorDraftToUpdateAutomotorDto(automotorDraft)).toEqual({
      chasis: 'CHASIS123',
      motor: 'MOTOR123',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });
  });
});
