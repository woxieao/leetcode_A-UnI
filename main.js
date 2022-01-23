//Artificial Unintelligent
class AUnI {
  defaultQuestionHref = '//leetcode-cn.com/problems/two-sum/'
  csrfToken
  questionSlug
  activeSessionId
  constructor() {
    this.init()
  }

  init() {
    var csrfTokenEle = document.getElementsByName('csrfmiddlewaretoken')
    if (csrfTokenEle.length === 0) {
      alert('请在LeetCode习题页重新运行本代码')
      location.href = this.defaultQuestionHref
      return
    } else {
      this.csrfToken = csrfTokenEle[0].ariaValueMax
    }
    var questionSlugInfo = location.href.split('problems/')
    if (questionSlugInfo.length !== 2) {
      this.questionSlug = propmpt(
        '未能自动识别题目,请手动填充题目slug',
        'two-sum',
      )
    } else {
      this.questionSlug = questionSlugInfo[1].split('/')[0]
    }
  }
  async query(options) {
    for (var i = 10; i > 0; i--) {
      options.url = options.url || '/graphql'
      options.headers = options.headers || {
        'Content-Type': 'application/json',
        'X-CSRFToken': this.csrfToken,
      }
      options.method = options.method || 'POST'

      if (options.method !== 'GET') {
        options.body = JSON.stringify(options.data)
      }

      try {
        return await (await fetch(options.url, options)).json()
      } catch {
        //冷却一下,以免报请求太多的异常
        await new Promise((resolve) => setTimeout(resolve, 3000))
        console.log(
          `这算法太顶了,服务器hold不住啦!正在重新发送(剩余${i - 1}次重试)`,
        )
      }
    }
    console.error(`请求${options.url}失败`)
  }

  async getRandomQuestion() {
    return (
      await this.query({
        data: {
          query:
            '\n    query problemsetRandomFilteredQuestion($categorySlug: String!, $filters: QuestionListFilterInput) {\n  problemsetRandomFilteredQuestion(categorySlug: $categorySlug, filters: $filters)\n}\n    ',
          variables: { categorySlug: 'algorithms', filters: {} },
        },
      })
    ).data.problemsetRandomFilteredQuestion
  }
  async getQuestionInfo(titleSlug) {
    var json = await this.query({
      data: {
        operationName: 'questionData',
        variables: { titleSlug: titleSlug },
        query:
          'query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    categoryTitle\n    boundTopicId\n    title\n    titleSlug\n    content\n    translatedTitle\n    translatedContent\n    isPaidOnly\n    difficulty\n    likes\n    dislikes\n    isLiked\n    similarQuestions\n    contributors {\n      username\n      profileUrl\n      avatarUrl\n      __typename\n    }\n    langToValidPlayground\n    topicTags {\n      name\n      slug\n      translatedName\n      __typename\n    }\n    companyTagStats\n    codeSnippets {\n      lang\n      langSlug\n      code\n      __typename\n    }\n    stats\n    hints\n    solution {\n      id\n      canSeeDetail\n      __typename\n    }\n    status\n    sampleTestCase\n    metaData\n    judgerAvailable\n    judgeType\n    mysqlSchemas\n    enableRunCode\n    envInfo\n    book {\n      id\n      bookName\n      pressName\n      source\n      shortDescription\n      fullDescription\n      bookImgUrl\n      pressImgUrl\n      productUrl\n      __typename\n    }\n    isSubscribed\n    isDailyQuestion\n    dailyRecordStatus\n    editorType\n    ugcQuestionId\n    style\n    exampleTestcases\n    __typename\n  }\n}\n',
      },
    })
    var codeSnippets = json.data.question.codeSnippets
    var cSharpCodeSnippets = codeSnippets.find((i) => i.lang === 'C#').code
    var regex = new RegExp(
      `public class Solution {([^{}]+){[^{}]+}[^{}]+}`,
      'i',
    )
    var matches = regex.exec(cSharpCodeSnippets)
    if (!matches || matches.length !== 2) {
      var msg = '无法匹配到代码模板,或者暂不支持此类型题目的生成'
      alert(msg)
      throw msg
    } else {
      return {
        methodName: matches[1].trim(),
        questionId: json.data.question.questionId,
        translatedTitle: json.data.question.translatedTitle,
      }
    }
  }

  async getSolutionArticles(questionSlug) {
    var json = await this.query({
      data: {
        operationName: 'questionSolutionArticles',
        variables: {
          questionSlug: questionSlug,
          first: 30,
          skip: 0,
          orderBy: 'MOST_UPVOTE',
          tagSlugs: ['csharp'],
          userInput: '',
        },
        query:
          'query questionSolutionArticles($questionSlug: String!, $skip: Int, $first: Int, $orderBy: SolutionArticleOrderBy, $userInput: String, $tagSlugs: [String!]) {\n  questionSolutionArticles(questionSlug: $questionSlug, skip: $skip, first: $first, orderBy: $orderBy, userInput: $userInput, tagSlugs: $tagSlugs) {\n    totalNum\n    edges {\n      node {\n        ...solutionArticle\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment solutionArticle on SolutionArticleNode {\n  rewardEnabled\n  canEditReward\n  uuid\n  title\n  slug\n  sunk\n  chargeType\n  status\n  identifier\n  canEdit\n  canSee\n  reactionType\n  reactionsV2 {\n    count\n    reactionType\n    __typename\n  }\n  tags {\n    name\n    nameTranslated\n    slug\n    tagType\n    __typename\n  }\n  createdAt\n  thumbnail\n  author {\n    username\n    profile {\n      userAvatar\n      userSlug\n      realName\n      __typename\n    }\n    __typename\n  }\n  summary\n  topic {\n    id\n    commentCount\n    viewCount\n    __typename\n  }\n  byLeetcode\n  isMyFavorite\n  isMostPopular\n  isEditorsPick\n  hitCount\n  videosInfo {\n    videoId\n    coverUrl\n    duration\n    __typename\n  }\n  __typename\n}\n',
      },
    })
    var edges = json.data.questionSolutionArticles.edges
    var slugList = []
    for (var i = 0; i < edges.length; i++) {
      slugList.push(edges[i].node.slug)
    }
    return slugList
  }
  async getSolutionArticleDetail(slug, matchMethodStr) {
    var json = await this.query({
      data: {
        operationName: 'solutionDetailArticle',
        variables: { slug: slug, orderBy: 'DEFAULT' },
        query:
          'query solutionDetailArticle($slug: String!, $orderBy: SolutionArticleOrderBy!) {\n  solutionArticle(slug: $slug, orderBy: $orderBy) {\n    ...solutionArticle\n    content\n    question {\n      questionTitleSlug\n      __typename\n    }\n    position\n    next {\n      slug\n      title\n      __typename\n    }\n    prev {\n      slug\n      title\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment solutionArticle on SolutionArticleNode {\n  rewardEnabled\n  canEditReward\n  uuid\n  title\n  slug\n  sunk\n  chargeType\n  status\n  identifier\n  canEdit\n  canSee\n  reactionType\n  reactionsV2 {\n    count\n    reactionType\n    __typename\n  }\n  tags {\n    name\n    nameTranslated\n    slug\n    tagType\n    __typename\n  }\n  createdAt\n  thumbnail\n  author {\n    username\n    profile {\n      userAvatar\n      userSlug\n      realName\n      __typename\n    }\n    __typename\n  }\n  summary\n  topic {\n    id\n    commentCount\n    viewCount\n    __typename\n  }\n  byLeetcode\n  isMyFavorite\n  isMostPopular\n  isEditorsPick\n  hitCount\n  videosInfo {\n    videoId\n    coverUrl\n    duration\n    __typename\n  }\n  __typename\n}\n',
      },
    })
    var content = json.data.solutionArticle.content
    var codeRegex = new RegExp('```csharp([^`]+)', 'i')
    var codeMatches = codeRegex.exec(content)
    if (!codeMatches || codeMatches.length != 2) {
      return false
    } else {
      var code = codeMatches[1]
      var answerMethodRegex = new RegExp(
        `(${matchMethodStr
          .replace('(', '\\(')
          .replace(')', '\\)')
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]')}[^{]?{)`,
        'i',
      )
      var argsReg = /\(([^\)]+)/
      var argsMatches = argsReg.exec(matchMethodStr)
      if (argsMatches.length !== 2) {
        var msg = '无法获取参数信息'
        alert(msg)
        throw msg
      }

      var funcNameReg = /([\S]+[\s]?)\(/
      var funcNameMatches = funcNameReg.exec(matchMethodStr)
      if (funcNameMatches.length !== 2) {
        var msg = '无法获取函数名称'
        alert(msg)
        throw msg
      }
      var argInfos = []
      var args = argsMatches[1].split(',')

      for (var x = 0; x < args.length; x++) {
        var arg = args[x]
        var argInfo = arg.split(' ')
        var argName = argInfo[argInfo.length - 1]
        if (argName) {
          var argType = argInfo[0]
          argInfos.push({ argName: argName, argType: argType })
        }
      }

      var matches = code.match(answerMethodRegex)
      if (matches && matches.length == 2) {
        var funcName = funcNameMatches[1]
        var methodName = matches[1]
        var returnTypeInfo = methodName.split(funcName)[0].trim().split(' ')

        return {
          code: code,
          methodName: methodName,
          index: matches.index,
          argInfos: argInfos,
          funcName: funcName,
          returnType: returnTypeInfo[returnTypeInfo.length - 1],
        }
      } else {
        return false
      }
    }
  }

  async submitAndGetResult(questionSlug, code, questionId, mode) {
    var json = await this.query({
      data: {
        question_id: questionId,
        lang: 'csharp',
        typed_code: code,
        test_mode: false,
        test_judger: '',
        questionSlug: questionSlug,
      },
      url: `/problems/${questionSlug}/submit/`,
    })

    for (var i = 0; i < 60; i++) {
      var checkResult = await this.query({
        url: `/submissions/detail/${json.submission_id}/check/`,
        method: 'GET',
      })
      if (checkResult.state === 'SUCCESS') {
        switch (mode) {
          case 'get_total_testcases': {
            return {
              totalTestcases: checkResult.total_testcases,
              isCorrectAnswer:
                checkResult.total_testcases === checkResult.total_correct,
            }
          }
          case 'get_full_testcases': {
            return checkResult.full_runtime_error
              .replace('Unhandled exception. System.Exception:', '')
              .split('\nLine')[0]
          }
          default: {
            return json.submission_id
          }
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    return { isCorrectAnswer: false }
  }

  compress(string, encoding) {
    const byteArray = new TextEncoder().encode(string)
    const cs = new CompressionStream(encoding)
    const writer = cs.writable.getWriter()
    writer.write(byteArray)
    writer.close()
    return new Response(cs.readable).arrayBuffer()
  }

  //答案太长了需要压缩一下否则leetcode会报错,但是这样的话每次解压缩,序列化又很浪费内存和时间,后期可以加个判断超长的才压缩
  async zip2Base64String(dataStr) {
    var bytes = await this.compress(dataStr, 'gzip')
    return btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)))
  }

  transfer2AUnICode(codeInfo) {
    var argStr = ''
    var testCaseCount = codeInfo.testCaseCount || 99999999
    for (var x = 0; x < codeInfo.argInfos.length; x++) {
      argStr += `${argStr ? ',' : ''}${codeInfo.argInfos[x].argName}`
    }
    var startPart = `${codeInfo.code.substr(0, codeInfo.index)}
     
      private static int _aUnICounter=0;
      private static List<object> _aUnIInputList=new List<object>();
      private static List<object> _aUnIOutputList=new List<object>();
      private static int __aUnIStep=0;
      `
    var midPart = `${codeInfo.methodName}   
    switch(__aUnIStep++%3)
    {
        case 0:{
            _aUnIInputList.Add(new{${argStr}});
            return ${codeInfo.funcName}(${argStr});
        }
        case 1:{
            var aUnIResult=${codeInfo.funcName}(${argStr});
            _aUnIOutputList.Add(aUnIResult);
            if(++_aUnICounter==${testCaseCount}){
                throw new Exception(Newtonsoft.Json.JsonConvert.SerializeObject(new {InputList=_aUnIInputList,OutputList=_aUnIOutputList}));
              };
            return aUnIResult;
        }
        case 2:{
//continue run
break;
        }
    }     
      `
    var endPart = `${codeInfo.code.substr(
      codeInfo.index + codeInfo.methodName.length,
    )}`

    return `${startPart} ${midPart} ${endPart}`
  }

  cSharpUnZipMethodStr = `
  /// <summary>
  /// 量子纠缠算法
  /// </summary>
  /// <param name="base64Data">波粒二象性字符串</param>
  /// <returns></returns>
  private static List<T>  RepeatedTransverseJumpAlgorithm<T>(string base64Data)
        {
            var bytes = Convert.FromBase64String(base64Data);
            using (var stream = new System.IO.Compression.GZipStream(new MemoryStream(bytes), System.IO.Compression.CompressionMode.Decompress))
            {
                const int size = 4096;
                var buffer = new byte[size];
                using (var memory = new MemoryStream())
                {
                    var count = 0;
                    do
                    {
                        count = stream.Read(buffer, 0, size);
                        if (count > 0)
                        {
                            memory.Write(buffer, 0, count);
                        }
                    }
                    while (count > 0);
                    return Newtonsoft.Json.JsonConvert.DeserializeObject<List<T>>(Encoding.UTF8.GetString(memory.ToArray()));
                }
            }
        }
  `
  async generateAUnIAnswer(codeInfo, answersStr, methodName) {
    var answer = JSON.parse(answersStr).OutputList
    var zipStr = await this.zip2Base64String(JSON.stringify(answer))

    return `
    public class Solution {       
    ${this.cSharpUnZipMethodStr} 
    private static int _aUnICounter=0;
    private static readonly List<${codeInfo.returnType}> _result= RepeatedTransverseJumpAlgorithm<${codeInfo.returnType}>("${zipStr}");
        ${methodName}
        {
            return _result[_aUnICounter++];
        }
    }    `
  }

  async getSessionId() {
    try {
      if (!this.activeSessionId) {
        var json = await this.query({
          data: {
            operationName: 'userStatusGlobal',
            variables: {},
            query:
              'query userStatusGlobal {\n  userStatus {\n    isSignedIn\n    isAdmin\n    isStaff\n    isSuperuser\n    isTranslator\n    isVerified\n    isPhoneVerified\n    isWechatVerified\n    checkedInToday\n    username\n    realName\n    userSlug\n    groups\n    avatar\n    optedIn\n    requestRegion\n    region\n    socketToken\n    activeSessionId\n    permissions\n    completedFeatureGuides\n    useTranslation\n    accountStatus {\n      isFrozen\n      inactiveAfter\n      __typename\n    }\n    __typename\n  }\n}\n',
          },
          url: `/graphql/noj-go`,
        })
        this.activeSessionId = json.data.userStatus.activeSessionId
      }
    } catch {
      var msg = '尚未登录,请登录后解题~'
      alert(msg)
      throw msg
    }
  }

  async engage(questionSlug) {
    await this.getSessionId()
    questionSlug = questionSlug || this.questionSlug
    var questionInfo = await this.getQuestionInfo(questionSlug)
    console.log(`开始自动生成[${questionInfo.translatedTitle}]的解法...`)
    var methodName = questionInfo.methodName

    var articleSlugs = await this.getSolutionArticles(questionSlug)
    for (var sId = 0; sId < articleSlugs.length; sId++) {
      var slug = articleSlugs[sId]
      var questionId = questionInfo.questionId
      var codeInfo = await this.getSolutionArticleDetail(slug, methodName)
      if (codeInfo) {
        console.log('正在生成量子纠缠算法...')
        var submitResult = await this.submitAndGetResult(
          questionSlug,
          this.transfer2AUnICode(codeInfo),
          questionId,
          'get_total_testcases',
        )
        if (submitResult.isCorrectAnswer) {
          codeInfo.testCaseCount = submitResult.totalTestcases
          console.log(`正在生成人工智障代码...(版本号:V${sId + 1})`)

          var answersStr = await this.submitAndGetResult(
            questionSlug,
            this.transfer2AUnICode(codeInfo),
            questionId,
            'get_full_testcases',
          )

          var codeResult = await this.generateAUnIAnswer(
            codeInfo,
            answersStr,
            methodName,
          )
          console.log('正在提交图灵完备的代码...')

          var lastSubmissionId = await this.submitAndGetResult(
            questionSlug,
            codeResult,
            questionId,
            methodName,
          )
          console.log(codeResult)
          if (confirm('是否查看提交结果')) {
            localStorage.setItem(
              `${this.activeSessionId}_${questionId}_csharp_code`,
              codeResult,
            )
            window.location.href = `/problems/${questionSlug}/`
          } else {
            console.log('答案已提交,上方是答案详情,点击下方链接可查看提交详情')
            var href = `https://${location.host}/submissions/detail/${lastSubmissionId}/`
            console.log(href)
          }

          return
        } else {
          console.log(`人工智障代码生成失败,正在重新生成...`)
        }
      }
    }
    //todo 暴力破解
    var nextQuestion = confirm(
      //'这道题太冷门了!暂时无法生成合适的题解,尝试启动人工智障模式暴力破解吗?\n',//todo遍历实现,耗时巨长
      '这道题太冷门了!人工智障暂时无法生成合适的题解,换一题吧~',
    )
    if (nextQuestion) {
      await leetCodeAUnI.engage(await this.getRandomQuestion())
    }
  }
}

var leetCodeAUnI = new AUnI()

// //copy这段去去控制台运行
// var aUnIScriptId = 'aUnIScript'
// var existingScript = document.getElementById(aUnIScriptId)
// if (!existingScript || existingScript.length === 0) {
//   var aUnIScript = document.createElement('script')
//   aUnIScript.id = aUnIScriptId
//   aUnIScript.src = 'https://a-uni.oss-cn-hangzhou.aliyuncs.com/leetcode/main.js'
//   document.head.appendChild(aUnIScript)
//   aUnIScript.onload = function () {
//     leetCodeAUnI.engage()
//   }
// } else {
//   await leetCodeAUnI.engage()
// }
