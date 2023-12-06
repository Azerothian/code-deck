
export default function waterfall(arr = [], func, start) {
  if (!Array.isArray(arr)) {
    throw new Error("IS NOT ARRAY");
  }
  return arr.reduce(function(promise, val, index) {
    return promise.then(function(prevVal) {
      return func(val, prevVal, index);
    });
  }, Promise.resolve(start));
}
