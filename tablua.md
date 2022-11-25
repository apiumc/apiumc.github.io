### 
一、关于统一ID，相关说明

统一登录，如果配置了管理员检测模式，则会自动检测第三方系统有没有与钉钉相一致的账户，有的话，则自动登录，没有能供示未找到对应账户，
我们通过此方式，确保第三方系统与钉钉账户一致，应用的ID统一。
大家关心的，如果顾家伙伴没有工号，只有手机号码，如果他换手机号码怎么处理，这点，我们也可以处理的，只要把顾家伙伴的工号设置为源手机号码，则换手机号码的事项也解决了。
同时在一此账户没有按统一ID形式创建，我们也可以出据审记报告，导出不一致的账户。

二、关于离职摘权安全，
统一登录是智能反向代理，对外来说对后端第三方应用是不可见，只要进不了统一登录，就进不了后端第三方应用，但第三方源应用，还有外在域名访问，就会导致统一登录不可访问，但通过外在域名就可以访问。
此解决方案如下：把第三方源域名解释到统一登录，统一登录可设置锁定源第三方应用登录界面自动跳转统一登录。其他请求不影响
采用此方式也保证的离职摘权安全，同时也保证了API请求不受影响。

三、现在问题：
按上次会议内容，我们主要是上线，采用是不改变密码形式，再加上域名也没有切到统一登录，在这样的情况，统一登录就是一个记住密码的收藏夹，但对现有人员来说，基本上浏览器都已经记录了密码，使用过程也没有什么不妥，人是有惰性了，我们很难改变当前人员使用习惯。

为了项目的快速推广，建议切换域名，达到与Jira和Confluence相同效果，则推广则成。也能达到我们安全需要，也只有这种方式，才能达到我们的统一ID的目标。



用带授权方式打开数据平台网址格式如下
```
https://data.kukahome.com/!/{device}/****

```
其中是device为终端设备号，****为有效网址路径，采用 http POST 表单请求获取授权终端码
 
**测试地址**:  `https://data.kukahome.com/`
  


#### 请求用例：
```

POST  dddsds/sdsd
```

#### 执行结果
执行请求‘’分次执行情况
100：



#### 表单头参数如下：

| 序号 | 总时间 |最多耗时|最少耗时|平均耗时|
| --- | --| --|--- |-- |
| URL          | https://data.kukahome.com/Auth    | 接口地址     |接口地址 |接口地址 |

#### 表单格式如下

| 正式参数               | 描述   | 是否必须 |
| ---------------------- | ------ | -------- |
| umc-request-user-time  | 时间戳 | 是       |
| umc-request-user-name  | 账户   | 是       |
| umc-request-user-alias | 别名   | 否       |
| umc-request-user-role  | 角色   | 否       |
| umc-request-user-sign  | 签名   | 是       |

#### 签名算法

签名生成的通用步骤如下：
第一步，设表单正文数据为集合 M，将集合 M 内非空参数值的参数按照参数名 ASCII 码从小到大排序（字典序），使用 URL 键值对的格式（即 key1=value1&key2=value2…）拼接成字符串 stringA。
特别注意以下重要规则：
◆ 参数名 ASCII 码从小到大排序（字典序）；
◆ 如果参数的值为空不参与签名；
◆ 参数名区分大小写；
◆ 传送的 `umc-request-user-sign` 参数不参与签名，将生成的签名与该 `umc-request-user-sign` 值作校验。
◆ 接口可能增加字段，验证签名时必须支持增加的扩展字段
第二步，在 stringA 最后拼接上 key 得到 stringSignTemp 字符串，并对 stringSignTemp 进行 MD5 运算，再将得到的字符串所有字符转换为小写，得到`umc-request-user-sign`值 signValue。

#### 签名公式

``` 
signValue=MD5(ASC(M)+"&key="+AppSecret)
```

获取 AppSecret 方式联系管理员
请求后，如果各签名和参数正确，则会返回如下格式

``` js
{
       "device":"EG8h5uME-UWNWhUPXCS1qA"
}
```

用此终端码替换网址，在浏览品中打开。

统一登录测试版本：
所在服务库：192.168.247.198
应用目录：/root/Web/
数据库：文件数据库
统一登录域名：sso2.kukahome.com,
应用域名：*.sso2.kukahome.com



宝哥，大公司用软件是要有保障能力的，我这里不知您这里是怎么想的，把保障能力建立起来，您想交出去，也就能交出来，如果想发展，也需要保障能力。

歆哥，你在顾家那段时间，那段时间对我来说是要命，我还没进一个月，你是一星期收到一投诉，一个月之后，技术环评还不及格，现在想想这叫什么事，后面，你叫我打个反身仗，我听您的应该是在两个月之内，独立搞定一个项目，还参与另外一个项目，两项目是有发文上线了，还负责那个叫工作流的技术运维，那是相当辛苦，再想想开始来一个月投诉，就写了个夸大词的试用期报告，（这本想着过了试用期就再向你认错），那里面的内容本身是为激化矛矛盾，是对技术环评不及格、入职一星期一投诉的回礼，来提升我们的立场，歆哥，当时也不是我不知妥协，一个工作强度太大，那种强度是坚持不下去的。


泰哥，感谢你告知我，如果能报警，你那里还是选择报警吧，
我这里也没有什么好说明的
从解决问题的角度来说，如果你能还原我最后离开的版本，这应该也是一个方式，解决了就算球了，如果不能还原，那我对他们的了解应该是动机问题了，改了又还原不回去，又没有按自己定的上线流程走，又不找问题为什么发生，多找几个人下水，为什么还拉我呢，顾家这么多安全机制，有安全团队的，还防止不了一个离职的环人嘛，

泰哥，说真话，
软件有软件的生命周期，解散一个软件核心人员带头人，这就软件是走向关停路线标志，
相当来说，自己研发系统，都是处于一个开发版本的系统，是个还没有成熟的系统，要想用，就要有人去克服他的不成熟，了解他的机理，找出不成熟点，完善它，这是正确对待他的态度。

软件版本是投入和成果的划分，开发版（投入阶段），测试版（试运行阶段），发行版（稳定阶段），开发版是没有成熟的系统，。


-----BEGINCERTIFICATEREQUEST-----MIICqDCCAZACAQAwYzEJMAcGA1UEBhMAMQkwBwYDVQQIEwAxCTAHBgNVBAcTADEqMCgGA1UECgwh5rmW5YyX5bCP6Zuo5Lye56eR5oqA5pyJ6ZmQ5YWs5Y+4MQkwBwYDVQQLEwAxCTAHBgNVBAMTADCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJxSj+e1ytCbW89TLUpo8IALev8jMhQMekj/Uh/t0YPzyZbn2QKqNY9I8tzwC6ItDv+rNtVlB9xDM46pzMlxDR9aARrrdGWfkY2VPShoTXFvHkwCSbqEitgPL5/gdZ2i1xEERw+nlhMLeWsLDkrGle9qVN0EHYUOcFyf42THuKIik48nswaxQEOHDFljBdNLlS2IH3keKiTf9L42y04W4VENJy6LH2pCR4qCyjByUA3Iqa5QRb4o6gN7xnfY5pp85VP4nREnTvJl1ZdhGGmG8B4Q4OUpHD8cWTkFIjiPtBuPlBaWY+c9HYb29Nq4SUlyDYUxAkszBTJn9JGGBoCvJesCAwEAAaAAMA0GCSqGSIb3DQEBBAUAA4IBAQAZrukR+h5LnRyGfnJNjUFNzVvP6BvD7xXMgcpzfZHXmNmuQANWFxdIfeIWmRGfDEyxNWXXCGOJkoYfxhMpamtca9lVVPvfnIUvSNvXHemDKuUnerRSS/M4wAZMRZMeorXbsMHuF7pZYry7haaUeCQ17RORoLjQiz5t/R25fHu8Poz/SIhfm417lhoOIkCAG9noG8Cl8WnNoxfmj+nRfUSphGWSN4gS7ntKgFxaEctJ4R+FGMoZvtH2y6p8neoRLzgqWZJm9X5/Gq40wRmEvGLtjPpWW6GyGj7sgSVFu0AVeYgZP2Zj8Wb/xbEmZS5bgFgHeS8ZgG6R2CNh3E4wO+ir-----ENDCERTIFICATEREQUEST-----


