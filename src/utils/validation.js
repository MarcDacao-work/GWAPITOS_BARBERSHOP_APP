// src/utils/validation.js
export const validation = {
  email: (email) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
    return null;
  },

  password: (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  fullName: (fullName) => {
    if (!fullName?.trim()) return 'Full name is required';
    if (fullName.trim().length < 2) return 'Full name must be at least 2 characters';
    return null;
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },

  validateSignup: (formData) => {
    const errors = {};

    errors.fullName = validation.fullName(formData.fullName);
    errors.email = validation.email(formData.email);
    errors.password = validation.password(formData.password);
    errors.confirmPassword = validation.confirmPassword(formData.password, formData.confirmPassword);

    // Remove null values
    Object.keys(errors).forEach(key => {
      if (errors[key] === null) {
        delete errors[key];
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateLogin: (formData) => {
    const errors = {};

    errors.email = validation.email(formData.email);
    errors.password = validation.password(formData.password);

    // Remove null values
    Object.keys(errors).forEach(key => {
      if (errors[key] === null) {
        delete errors[key];
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
};