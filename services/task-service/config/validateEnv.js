const validateEnv = () => {
  const required = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
  ];

  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`${key} is missing in .env`);
    }
  });
};

export default validateEnv;