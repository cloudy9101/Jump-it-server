const mongoose = require('mongoose');
const faker = require('faker');
const config = require('../../src/config');
const User = require('../../src/models/User');
const workoutService = require('../../src/services/workoutService');
const userService = require('../../src/services/UserService');

beforeAll(async () => {
  mongoose
    .connect(config.db.testMongoUrl + '_stepcount_service_test', {
      useNewUrlParser: true
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
  console.log('ddddd');
});

afterAll(async () => {
  await User.deleteMany({});
});

const userParams = {
  username: 'test',
  password: '123123',
  avator: 'test',
  firstName: 'first',
  lastName: 'last',
  gender: 1,
  birthday: '1990-01-01',
  height: 175,
  weight: 75
};
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

const getUserId = async () => {
  const newUser = await createUser();
  return newUser._id;
};
describe('workout service test ', () => {
  test('save workout data', async () => {
    const user_id = await getUserId();
    const mockData = {
      step: {
        value: 2000,
        startDate: '2019-09-08T12:00:00.000-0400',
        endDate: '2016-09-09T12:00:00.000-0400'
      },
      date: new Date()
    };
    const result = await workoutService.saveData(user_id, mockData);
    console.log(result);
    expect(result).not.toBeNull();
  });
});
