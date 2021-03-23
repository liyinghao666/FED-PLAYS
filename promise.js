class promise {
  constructor(fn) {
    this._result = null
    this._reason = null
    this._state = "pending"
    this._resolve = this._resolve.bind(this)
    this._resolveCallBack = function(){}
    this._reject = this._reject.bind(this)
    this._rejectCallBack = function(){}
    fn(this._resolve, this._reject)
  }
  _resolve(res) {
    if(this._state === "pending") {
      this._state = "resolve"
      this._result = res
      this._resolveCallBack(res)
    } else {
      console.error("immutable state in promise!");
    }
  }
  _reject(rej) {
    if(this._state === "pending") {
      this._state = "reject"
      this._reason = rej
      this._rejectCallBack(rej)
    } else {
      console.error("immutable state in promise!");
    }
  }
  then(resolveCall, rejectCall) {
    const prepromise = this
    return new promise((resolve, reject) => {
      setTimeout(() => {
        let currentpromiseResult
        switch (prepromise._state) {
          case "pending":
            prepromise._resolveCallBack = function(res) {
              const currentpromiseResult = resolveCall(prepromise._result)
              if(currentpromiseResult && currentpromiseResult.then) {
                switch (currentpromiseResult._state) {
                  case "pending":
                    currentpromiseResult._resolveCallBack = function(res) {
                      resolve(res)
                    }
                    currentpromiseResult._rejectCallBack = function(rej) {
                      reject(rej)
                    }
                    break
                  case "resolve":
                    resolve(currentpromiseResult._result)
                    break
                  case "reject":
                    reject(currentpromiseResult._reason)
                    break
                  default:
                    break
                }
              } else {
                resolve(currentpromiseResult)
              }
            }
            prepromise._rejectCallBack = function(rej) {
              const currentpromiseResult = rejectCall(prepromise._reason)
              if(currentpromiseResult.then) {
                switch (currentpromiseResult._state) {
                  case "pending":
                    currentpromiseResult._resolveCallBack = function(rej) {
                      resolve(rej)
                    }
                    currentpromiseResult._rejectCallBack = function(rej) {
                      reject(rej)
                    }
                    break
                  case "resolve":
                    resolve(currentpromiseResult._result)
                    break
                  case "reject":
                    reject(currentpromiseResult._reason)
                    break
                  default:
                    break
                }
              } else {
                reject(currentpromiseResult)
              }
            }
            break
          case "resolve":
            currentpromiseResult = resolveCall(prepromise._result)
            if(currentpromiseResult.then) {
              switch (currentpromiseResult._state) {
                case "pending":
                  currentpromiseResult._resolveCallBack = function(res) {
                    resolve(res)
                  }
                  currentpromiseResult._rejectCallBack = function(rej) {
                    reject(rej)
                  }
                  break
                case "resolve":
                  resolve(currentpromiseResult._result)
                  break
                case "reject":
                  reject(currentpromiseResult._reason)
                  break
              }
            } else {
              resolve(prepromise._result)
            }
            break
          case "reject":
            currentpromiseResult = rejectCall(prepromise._reason)
            if(currentpromiseResult._state) {
              switch (currentpromiseResult._state) {
                case "pending":
                  break
                case "resolve":
                  break
                case "reject":
                  break
              }
            } else {
              reject(prepromise._reason)
            }
            break
        }
      })
    })
  }
}
const p = new promise((resolve, reject) => {
  console.log("1")
  resolve("1 finished")
}).then(res => new promise((resolve, reject) => {
  console.log(res)
  setTimeout(() => {
    console.log("2")
    resolve("2 finished")
  }, 1000);
})).then((res) => console.log(res))