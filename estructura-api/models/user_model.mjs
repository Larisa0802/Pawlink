export class User{
    constructor({id, email, nombre, apellidos, telefono, direccion, admin,fecha_registro,}){
        this.id = id
        this.email = email
        this.nombre = nombre
        this.apellidos = apellidos
        this.telefono = telefono
        this.direccion = direccion
        this.fecha_registro = fecha_registro
        this.admin = admin
    }

    printBasico(){
        console.log(`UserId:${this.id},Email:${this.email}, Nombre:${this.nombre}, Apellidos: ${this.apellidos}, Direccion: ${this.direccion}, Telefono: ${this.telefono}, Fecha Registro: ${this.fecha_registro}, Admin: ${this.admin}`)
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

    getApellidos() {
        return this.apellidos
    }

    setApellidos(apellidos){
        this.apellidos = apellidos
    }

    getDireccion() {
        return this.direccion
    }

    setDireccion(direccion) {
        this.direccion = direccion
    }

    getTelefono(){
        return this.telefono
    }

    setTelefono(telefono){
        this.telefono = telefono
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