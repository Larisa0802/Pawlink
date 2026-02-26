export class User{
    constructor({id, email, nombre, fecha_registro, admin}){
        this.id = id
        this.email = email
        this.nombre = nombre
        this.fecha_registro = fecha_registro
        this.admin = admin
    }

    printBasico(){
        console.log(`UserId:${this.id},Email:${this.email}, Nombre:${this.nombre}, Fecha Registro: ${this.fecha_registro}, Admin: ${this.admin}`)
    }

    getId() {
        return this.id
    }

    setId(id) {
        this.id = id
    }

    getEmail() {
        return this.email
    }

    setEmail(email) {
        this.email = email
    }

    getNombre() {
        return this.nombre
    }

    setNombre(nombre) {
        this.nombre = nombre
    }

    getFechaRegistro() {
        return this.fecha_registro
    }

    setFechaRegistro(fecha_registro) {
        this.fecha_registro = fecha_registro
    }

    getAdmin() {
        return this.admin
    }

    setAdmin(admin) {
        this.admin = admin
    }
}