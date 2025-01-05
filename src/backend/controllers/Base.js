class Base {
    constructor(id) {
        this.id = id;
    }

    getById(req, res) {
        throw new Error("Unimplemented method: getById");
    }
}

module.exports = Base