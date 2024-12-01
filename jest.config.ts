export default {
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],  // Helps Jest find modules
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],  // Add more extensions
};
