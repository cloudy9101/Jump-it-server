const mongoose = require('mongoose');
const faker = require('faker');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const User = require('../../src/models/User');
const Diet = require('../../src/models/Diet');
const userService = require('../../src/services/UserService');

const userParams = {
  username: "test",
  password: "123123",
  avator: "test",
  firstName: "first",
  lastName: "last",
  gender: 1,
  birthday: "1990-01-01",
  height: 175,
  weight: 75
}

const createUser = async () => {
  const email = faker.internet.email();
  const user = User({ ...userParams, password: await userService.hashPassword(userParams.password), email });
  await user.save()
  return user
}

beforeAll(async () => {
  mongoose
    .connect(config.db.testMongoUrl + "_plan_service_test", { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
})

afterAll(async () => {
  await User.deleteMany({});
  await Diet.deleteMany({});
})

const planService = require('../../src/services/Plan');

describe('plan services', () => {
  test('get exercise plan service', async () => {
    const user = await createUser();
    const payload = {
      id: user._id
    };
    const date = new Date();

    const exercisePlan = planService.getExercisePlan(user, date);

    const fs = require('fs');
    const file = fs.readFileSync(__dirname + '/../../src/config/exercises.json', 'utf8');
    const exercisePlans = JSON.parse(file, date);
    const weekday = date.getDay();

    const expected = exercisePlans['lower'][weekday];
    expect(exercisePlan).toStrictEqual(expected);
  });

  test('get diets service', async () => {
    const user = await createUser();
    const diet = Diet({
      userId: user._id,
      name: faker.name.firstName(),
      value: faker.random.number()
    });
    await diet.save();

    const diets = await planService.getDiets(user._id);
    expect(diets.length).toBe(1);
  });

  test('add diet service', async () => {
    const user = await createUser();
    const diet = await planService.addDietService(user._id, faker.name.firstName(), faker.random.number());
    const diets = await Diet.find({userId: user._id});
    expect(diets.length).toBe(1);
  });
});
