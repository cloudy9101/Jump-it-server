const mongoose = require('mongoose');
const faker = require('faker');
const User = require('../../src/models/User');
const config = require('../../src/config');
const measureService = require('../../src/services/measureService');
const userService = require('../../src/services/UserService');

beforeAll(async () => {
  mongoose
    .connect(config.db.testMongoUrl + '_measure_service_test', {
      useNewUrlParser: true
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
});

afterAll(async () => {
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
const userParams = {
  username: 'test2',
  password: '123123',
  avator: 'test',
  firstName: 'first',
  lastName: 'last',
  gender: 1,
  birthday: '1990-01-01',
  height: 175,
  weight: 75
};
const getUserId = async () => {
  const newUser = await createUser();
  return newUser._id;
};

describe('measure service ', () => {
  test('save measue', async () => {
    const user_id = await getUserId();
    const mockDate = {
      low: 30,
      high: 100,
      value: 20,
      date: new Date()
    };
    const result = await measureService.saveMeasurement(
      user_id,
      mockDate.low,
      mockDate.high,
      mockDate.value,
      mockDate.date
    );
    expect(result).not.toBeNull();
  });
  test('find high blood pressure', async () => {
    const user_id = await getUserId();
    const result = await measureService.findHB(user_id, new Date(), 'WEEK');
    expect(result).not.toBeNull();
  });
  test('find sugar', async () => {
    const user_id = await getUserId();
    const result = await measureService.findSugar(user_id, new Date(), 'WEEK');
    expect(result).not.toBeNull();
  });
  test('find Step', async () => {
    const user_id = await getUserId();
    const result = await measureService.findStep(user_id, new Date(), 'WEEK');
    expect(result).not.toBeNull();
  });
});
