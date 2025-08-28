import * as authService from '../services/authService.js';


export const registerUser = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data); 
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json(data); 
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const data = await authService.getProfile(req.user._id);
    res.json(data); 
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
