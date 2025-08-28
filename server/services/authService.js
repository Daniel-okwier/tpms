import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';

// Register a new user
export const register = async ({ name, email, password, role }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, role });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: generateToken(user._id, user.role),
  };
};

// Login user
export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid email or password');
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: generateToken(user._id, user.role),
  };
};

// Get user profile
export const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
