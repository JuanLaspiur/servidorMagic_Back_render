'use strict'

const Category = use("App/Models/Category")

class CategoryController {
  async index ({ response }) {
    try {
      const categories = await Category.all()
      response.send(categories)
    } catch (error) {
      console.error('index Category: ' + error.name + ': ' + error.message)
      response.status(500).send({ error: 'Error al obtener categorías' })
    }
  }
  async store ({ request, response }) {
    try {
      const categoryData = request.only(['id', 'name', 'description', 'icon'])
      const category = await Category.create(categoryData)
      response.status(201).send(category)
    } catch (error) {
      console.error('store Category: ' + error.name + ': ' + error.message)
      response.status(500).send({ error: 'Error al crear la categoría' })
    }
  }

  async show ({ params, response }) {
    try {
      const category = await Category.find(params.id)
      if (!category) {
        response.status(404).send({ error: 'Categoría no encontrada' })
        return
      }
      response.send(category)
    } catch (error) {
      console.error('show Category: ' + error.name + ': ' + error.message)
      response.status(500).send({ error: 'Error al obtener la categoría' })
    }
  }

  async update ({ params, request, response }) {
    try {
      const category = await Category.find(params.id)
      if (!category) {
        response.status(404).send({ error: 'Categoría no encontrada' })
        return
      }
      const categoryData = request.only(['name', 'description', 'icon']) // Ajusta esto según los campos de tu modelo
      category.merge(categoryData)
      await category.save()
      response.send(category)
    } catch (error) {
      console.error('update Category: ' + error.name + ': ' + error.message)
      response.status(500).send({ error: 'Error al actualizar la categoría' })
    }
  }

  async destroy ({ params, response }) {
    try {
      const category = await Category.find(params.id)
      if (!category) {
        response.status(404).send({ error: 'Categoría no encontrada' })
        return
      }
      await category.delete()
      response.send({ message: 'Categoría eliminada correctamente' })
    } catch (error) {
      console.error('destroy Category: ' + error.name + ': ' + error.message)
      response.status(500).send({ error: 'Error al eliminar la categoría' })
    }
  }
}

module.exports = CategoryController