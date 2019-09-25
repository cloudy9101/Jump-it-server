const mongoose = require('mongoose');
const faker = require('faker');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const User = require('../../src/models/User');
const FcmToken = require('../../src/models/FcmToken');

beforeAll(async () => {
  mongoose
    .connect(config.db.testMongoUrl + '_user_service_test', {
      useNewUrlParser: true
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
});

const userService = require('../../src/services/UserService');
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

describe('user services', () => {
  test('sign up service', async () => {
    const params = { ...userParams, email: 'test1@test.com' };
    const token = await userService.signUpService(params);

    const user = await User.findOne({ email: params.email });
    const payload = {
      id: user._id
    };
    const expected = await jwt.sign(payload, config.privateKey);
    expect(token).toBe(expected);
  });

  test('sign in service', async () => {
    const newUser = await createUser();
    const token = await userService.signInService(
      newUser.email,
      userParams.password
    );

    const payload = {
      id: newUser._id
    };
    const expected = await jwt.sign(payload, config.privateKey);
    expect(token).toBe(expected);
  });

  test('change password service', async () => {
    const user = await createUser();

    const newPassword = '111111';
    await userService.changePasswordService(
      user._id,
      userParams.password,
      newPassword
    );
    const result = await bcrypt.compare(newPassword, user.password);
    expect(result).not.toBe(null);
  });

  test('update user service', async () => {
    const user = await createUser();

    const newUsername = faker.name.firstName();

    const updatedUser = await userService.updateUserService(user._id, {
      username: newUsername
    });

    expect(updatedUser.username).toBe(newUsername);
  });

  test('update notification enabled service', async () => {
    const user = await createUser();

    const newUser = await userService.updateNotificationEnabledService(
      user._id,
      true
    );

    expect(newUser.notificationEnabled).toBe(true);
  });

  test('forget password service', async () => {
    const user = await createUser();

    const result = await userService.forgetPasswordService(
      user.email,
      userParams.password
    );

    expect(result).not.toBe(null);
  });

  test('device reg service', async () => {
    const user = await createUser();
    const deviceId = faker.random.number();
    const regToken = faker.random.number();

    const fcmToken = await userService.deviceRegService(
      user._id,
      deviceId,
      regToken
    );

    expect(fcmToken.deviceId).toBe(String(deviceId));
    expect(fcmToken.token).toBe(String(regToken));
  });

  test('device reg service', async () => {
    const user = await createUser();
    const deviceId = faker.random.number();
    const regToken = faker.random.number();
    const fcmToken = FcmToken({
      userId: user._id,
      deviceId: deviceId,
      token: regToken
    });
    await fcmToken.save();

    await userService.deviceUnregService(user._id, deviceId);
    const res = await FcmToken.findOne({
      userId: user._id,
      deviceId: deviceId
    });
    expect(res).toBe(null);
  });
});
