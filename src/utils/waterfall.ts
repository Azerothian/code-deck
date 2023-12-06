export default function waterfall<T>(arr: T[], func: (currentVal: T, prevVal: any, arg2: number) => any, start?: any) {
  return (arr.reduce(function(promise, val, index) {
    return promise.then(function(prevVal: any) {
      return func(val, prevVal, index);
    });
  }, Promise.resolve(start)));
}
