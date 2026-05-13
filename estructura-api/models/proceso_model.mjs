export default class Proceso {
  constructor(id, usuario_id, animal_id, confirmacion, revision, preparacion, preparativo, firma, fecha, animal, protectora) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.animal_id = animal_id;
    this.confirmacion = confirmacion ?? false;
    this.revision = revision ?? false;
    this.preparacion = preparacion ?? false;
    this.preparativo = preparativo ?? false;
    this.firma = firma ?? false;
    this.fecha = fecha;
    this.animal = animal ?? null;
    this.protectora = protectora ?? null;
    this.pasoActual = [this.confirmacion, this.revision, this.preparacion, this.preparativo, this.firma]
      .filter(Boolean).length;
  }
}
