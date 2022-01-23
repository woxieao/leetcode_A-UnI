//copy这段去去控制台运行
var aUnIScriptId = 'aUnIScript'
var existingScript = document.getElementById(aUnIScriptId)
if (!existingScript || existingScript.length === 0) {
  var aUnIScript = document.createElement('script')
  aUnIScript.id = aUnIScriptId
  aUnIScript.src = 'https://a-uni.oss-cn-hangzhou.aliyuncs.com/leetcode/main.js'
  document.head.appendChild(aUnIScript)
  aUnIScript.onload = function () {
    leetCodeAUnI.engage()
  }
} else {
  await leetCodeAUnI.engage()
}
