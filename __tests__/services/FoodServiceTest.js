const mongoose = require('mongoose');
const faker = require('faker');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const User = require('../../src/models/User');
const Food = require('../../src/models/food');
const FoodService = require('../../src/services/FoodService');

beforeAll(async () => {
  mongoose
    .connect(config.db.testMongoUrl + '_food_service_test', {
      useNewUrlParser: true
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
});

const userService = require('../../src/services/UserService');
const userParams = {
  username: 'test1',
  password: '321123',
  avator: 'test',
  firstName: 'first',
  lastName: 'last',
  gender: 1,
  birthday: '1991-01-01',
  height: 175,
  weight: 75
};

afterEach(async () => {
  await User.deleteMany({});
});

const createUser = async () => {
  const email = faker.internet.email();

  const user = User({
    ...userParams,
    password: await userService.hashPassword(userParams.password),
    email
  });
  await user.save();
  return user;
};

const foodParams = {
  name: 'apple',
  value: '3',
  imgUri: '/test',
  imgIndex: '1'
};

const getUserId = async () => {
  const newUser = await createUser();
  return newUser._id;
};
describe('food test', () => {
  test('create new food', async () => {
    const user_id = await getUserId();
    const newFood = await FoodService.createFood(
      user_id,
      foodParams.name,
      foodParams.value,
      foodParams.imgUri,
      foodParams.imgIndex
    );
    const expected = foodParams.name;
    expect(newFood.name).toBe(expected);
  });
  test('find foods ', async () => {
    const user_id = await getUserId();
    const foods = await FoodService.findFoods(user_id);
    expect(foods).not.toBeNull();
  });

  test('delete food', async () => {
    const user_id = await getUserId();
    const newFood = await FoodService.createFood(
      user_id,
      foodParams.name,
      foodParams.value,
      foodParams.imgUri,
      foodParams.imgIndex
    );
    const result = await FoodService.removeFood(newFood._id, user_id);
    expect(result.name).toBe(foodParams.name);
  });
  test('update food', async () => {
    const user_id = await getUserId();
    const newFood = await FoodService.createFood(
      user_id,
      foodParams.name,
      foodParams.value,
      foodParams.imgUri,
      foodParams.imgIndex
    );
    const result = await FoodService.update(newFood._id, user_id, 'newName');
    expect(result.name).toBe('newName');
  });
});
