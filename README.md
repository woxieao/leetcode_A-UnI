# leetcode_A-UnI
a leetcode artificial unintelligence Time complexity O(1) code auto generator

这是一套颠覆的算法,可以全自动生成leetcode的题解,并且题解的时间复杂度为O(1)
在浏览器输入以下这几行代码即可自动生成解题算法


//copy这段去去控制台运行
//copy to browser console to run


var aUnIScriptId = 'aUnIScript';
var existingScript = document.getElementById(aUnIScriptId);
if (!existingScript || existingScript.length === 0) {
  var aUnIScript = document.createElement('script');
  aUnIScript.id = aUnIScriptId;
  aUnIScript.src = 'https://a-uni.oss-cn-hangzhou.aliyuncs.com/leetcode/main.js';
  document.head.appendChild(aUnIScript);
  aUnIScript.onload = function () {
    leetCodeAUnI.engage();
  }
} else {
  await leetCodeAUnI.engage();
}
