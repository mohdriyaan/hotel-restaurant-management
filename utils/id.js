export default function idGenerate(len) {
    let arr = [];
    let random;
    let otpJoin;
    for (let i = 0; i < len; i++) {
      random = Math.floor(Math.random() * 10);
      arr.push(random);
      otpJoin = arr.join("");
    }
    return +otpJoin;
}