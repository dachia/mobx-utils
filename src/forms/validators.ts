const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const phoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/

export const required = (message = 'Value required') => (val) => !val && message
export const matchRegex = (regex, message = `Doesn't match regex ${regex}`) => (val) => val && !regex.test(val) && message
export const email = (message = 'Invalid email') =>
  matchRegex(emailRegex, message)
export const phoneNumber = (message = 'Invalid phone number') =>
  matchRegex(phoneRegex, message)
export const lengthBetween = (min = 6, max = 20, message = `Length must be between ${min} and ${max}`) =>
  (val) => val && !((min <= val.length) && (val.length <= max)) && message
export const atLeastOne = (message = 'Must have at least one element') => val => !val.length && message
