class Animal {
    constructor(id, nombre, chip, especie, raza, sexo, fecha_nacimiento, color, pelaje, vacunas, esterilizado, desparasitado, foto, nivel_energia, tamano, disponible) {
        this._id = id;
        this._nombre = nombre;
        this._chip = chip;
        this._especie = especie;
        this._raza = raza;
        this._sexo = sexo;
        this._fecha_nacimiento = fecha_nacimiento;
        this._color = color;
        this._pelaje = pelaje;
        this._vacunas = vacunas;
        this._esterilizado = esterilizado;
        this._desparasitado = desparasitado;
        this._foto = foto;
        this._disponible = disponible;
        this._nivel_energia = nivel_energia
        this._tamano = tamano
    }

    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get chip() { return this._chip; }
    get especie() { return this._especie; }
    get raza() { return this._raza; }
    get sexo() { return this._sexo; }
    get color() { return this._color; }
    get pelaje() { return this._pelaje; }
    get vacunas() { return this._vacunas; }
    get foto() { return this._foto; }
    get nivel_energia() { return this._nivel_energia; }
    get tamano() { return this._tamano; }
    get disponible() { return this._disponible; }

    get fecha_nacimiento() {
        if (!this._fecha_nacimiento) return '—';
        const date = new Date(this._fecha_nacimiento);
        return date.toLocaleDateString('es-ES');
    }

    get esterilizado() {
        return this._esterilizado ? 'Sí' : 'No';
    }

    get desparasitado() {
        return this._desparasitado ? 'Sí' : 'No';
    }
}

export default Animal;