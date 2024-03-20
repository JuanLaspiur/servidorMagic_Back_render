'use strict'

/*
|--------------------------------------------------------------------------
| CiudadSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Category = use("App/Models/Category")
const categoryData = [
  {
    id: 1,
    name: 'Cañas y tapas',
    icon: 'cat-06.png',
    description: 'Planes espontáneos para tomar algo.'
  },
  {
    id: 2,
    name: 'Planes nocturnos',
    icon: 'cat-02.png',
    description: 'Discotecas, pubs, karaokes, etc.'
  },
  {
    id: 3,
    name: 'Planes gastronómicos',
    icon: 'cat-05.png',
    description: 'Comidas, cenas, ferias gastronómicas, cursos de cocina, etc.'
  },
  {
    id: 4,
    name: 'Deportes, actividades al aire libre y rutas',
    icon: 'cat-03.png',
    description: 'Senderismo, excurciones, rutas a caballo, escalada, etc.'
  },
  {
    id: 5,
    name: 'Actividades culturales',
    icon: 'cat-01.png',
    description: 'Museos, cines, teatros, conciertos, etc.'
  },
  {
    id: 6,
    name: 'Intercambio de idiomas',
    icon: 'cat-04.png',
    description: ''
  },
  {
    id: 7,
    name: 'Otro tipo de actividades',
    icon: 'cat-07.png',
    description: 'Parques de atracciones, juegos de mesa, scape room, viajes, etc.'
  },
  {
    id: 8,
    name: 'Todos',
    icon: 'cat-todos.png',
    description: 'Todo tipo de planes'
  }
]
class CategorySeeder {
  async run () {
    // await Ciudad.query().delete()
    for (let i in categoryData) {
      let category = await Category.findBy('id', categoryData[i].id)
      if (!category) {
        await Category.create(categoryData[i])
      } else {
        category.name = categoryData[i].name
        await category.save()
      }
    }
  }
}

module.exports = CategorySeeder
