<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>GRB-IMT @yield('title')</title>

    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
    <link rel="manifest" href="/manifest.json">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
    <meta name="theme-color" content="#ffffff">

    @yield('page-script')

    <!-- Fonts -->
    <link href="//fonts.googleapis.com/css?family=Lato:100,300,400,700" rel='stylesheet' type='text/css'>
    <link href="//fonts.googleapis.com/css?family=Oswald:100,300,400,700" rel='stylesheet' type='text/css'>

    <!-- Styles -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css" rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="fonts/awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/bootstrap-social-gh-pages/bootstrap-social.css">
    <link rel="stylesheet" href="css/bootstrap-3.3.6-dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="/css/bootstrap.slate.min.css">
    <link rel="stylesheet" href="/css/loading-bar.css">

    <!-- Footer Styles -->
    <link rel="stylesheet" href="css/footer.css">

    @yield('page-style')

    <style>
            html, body {
                height: 100%;
            }

            body {
                margin: 0;
                padding: 0;
                width: 100%;
                display: table;
                /*font-family: 'Lato', "Source Sans Pro", sans-serif; */
                font-size: 12px;
            }

            #map-wrap {
               top: 0;
               bottom:0;
               /* position:fixed; */
               overflow-y:hidden;
               overflow-x:hidden;
            }
            .container {
                text-align: left;
                vertical-align: middle;
            }

            .content {
                text-align: center;
                display: inline-block;
            }

            .title {
                font-size: 76px;
            }

            .fa-btn {
            margin-right: 6px;
            }
            .article-img {
               display: inline-block;
               /* vertical-align: middle; */
               margin-left: 5%;
               margin-bottom: 2%;
               width: 90%;
               height: 300px;
            }
            .article-img img{
               border: 1px dashed transparent;
               border-color: #e7e7e7;
               width: 100%;
               height: 100%;
            }
/*
            .navbar {
               min-height: 30px;
               margin-bottom: 5px;
            }
*/
            .panel-heading {
               font-family: 'Oswald';
               font-size: 16px;
            }

            #footerLogo {margin-bottom: 22px;}
            #footerRights {padding-top:22px;padding-bottom:22px;margin-top:22px; text-align: center; font-size:10px;}
            .footerWidget {margin-bottom: 22px}

            footer {
               padding:44px 0 0 0;
               color: #777;
               background: #f8f8f8;
               border-top: 1px solid transparent;
               border-color: #e7e7e7;
            }

            /* footer 1 */
            .worksList li{display:inline-block; margin: 0 10px 10px 0;}

            /* footer 4 */
            .footer4 #footerRights {text-align: left; background:#e7e7e7;}
            .bigTitle.bigTitleFooter {font-size: 2em; margin-bottom: 0;}

            #footerRights {
               background-color: #f8f8f8;
               color: #999;
               border-top: 1px solid #e7e7e7;
               padding-top: 22px;
               padding-bottom: 22px;
               margin-top: 22px;
               text-align: center;
               font-size: 10px;
               display: block;
               font-family: 'Oswald';
            }
/*
            .navbar-header {
               float: left;
               font-size: 15px;
               padding: 5px;
               font-family: 'Oswald';
            }
            .navbar-header > a.active{
               font-weight:bold;
               font-size: 15px;
               color: white !important;
            }

            .navbar-collapse.collapse {
               height: 35px !important;
            }
*/

/*            .navbar-default { */
               /*font: normal 36px 'Cookie', cursive;*/ /*
               font: normal 16px sans-serif;
               text-decoration: none;
               background-color: #292c2f;
            }

            .navbar-brand {
               color: #efe3e3 !important;
               font-family: 'Oswald';
               font-size: 15px;
               -o-object-fit: contain;
               object-fit: contain;
            }
            .navbar>.container-fluid .navbar-brand {
                margin-left: -5px;
            }
*/

.navbar-default {
  background-color: #463d49;
  border-color: #887d8d;
}
.navbar-default .navbar-brand {
  color: #adb9bb;
}
.navbar-default .navbar-brand:hover,
.navbar-default .navbar-brand:focus {
  color: #f9f9f9;
}
.navbar-default .navbar-text {
  color: #adb9bb;
}
.navbar-default .navbar-nav > li > a {
  color: #adb9bb;
}
.navbar-default .navbar-nav > li > a:hover,
.navbar-default .navbar-nav > li > a:focus {
  color: #f9f9f9;
}
.navbar-default .navbar-nav > .active > a,
.navbar-default .navbar-nav > .active > a:hover,
.navbar-default .navbar-nav > .active > a:focus {
  color: #f9f9f9;
  background-color: #887d8d;
}
.navbar-default .navbar-nav > .open > a,
.navbar-default .navbar-nav > .open > a:hover,
.navbar-default .navbar-nav > .open > a:focus {
  color: #f9f9f9;
  background-color: #887d8d;
}
.navbar-default .navbar-toggle {
  border-color: #887d8d;
}
.navbar-default .navbar-toggle:hover,
.navbar-default .navbar-toggle:focus {
  background-color: #887d8d;
}
.navbar-default .navbar-toggle .icon-bar {
  background-color: #adb9bb;
}
.navbar-default .navbar-collapse,
.navbar-default .navbar-form {
  border-color: #adb9bb;
}
.navbar-default .navbar-link {
  color: #adb9bb;
}
.navbar-default .navbar-link:hover {
  color: #f9f9f9;
}

@media (max-width: 767px) {
  .navbar-default .navbar-nav .open .dropdown-menu > li > a {
    color: #adb9bb;
  }
  .navbar-default .navbar-nav .open .dropdown-menu > li > a:hover,
  .navbar-default .navbar-nav .open .dropdown-menu > li > a:focus {
    color: #f9f9f9;
  }
  .navbar-default .navbar-nav .open .dropdown-menu > .active > a,
  .navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover,
  .navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus {
    color: #f9f9f9;
    background-color: #887d8d;
  }
}

            .vim {
               display: inline-block;
               font: normal normal normal 14px/1 FontAwesome;
               font-size: inherit;
               text-rendering: auto;
               -webkit-font-smoothing: antialiased;
               -moz-osx-font-smoothing: grayscale;
               height: 100%;
            }
               /* background-color: transparent; */

            @media(min-width:992px){
               /* footer 4 */
               .footer4 #footerRights .quickMenu {float:right;}
               /* footer 5 */
               .footer5 #footerRights p{float: left;}
               .footer5 #footerRights .socialNetwork{float: right;}
            }
    </style>
</head>
<!-- yield('bodydef') -->
<body id="app-layout" ng-app="app" class="ng-scope">

<!-- <a class="navbar-brand{{ (Request::is('home') ? ' active' : '')}}" href="{{ url('/home') }}"> Home </a> -->
<!-- {!! Html::image('img/appnoname.png', 'appnoname logo',  array('class' => 'navbar-left img-responsive pull-left')) !!} -->
    <!-- <nav class="navbar navbar-default"> -->
    <div class="navbar navbar-default" role="navigation" data-ng-controller="HomeController">
        <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        <a class="navbar-brand{{ (Request::is('/') ? ' active' : '')}}" href="{{ url('/') }}#/"> Home </a>
        <a class="navbar-brand{{ (Request::is('about') ? ' active' : '')}}" href="{{ url('/about') }}#/"> About </a>
        </div>

            <div class="navbar-collapse collapse">
                <ul class="nav navbar-nav navbar-right">
                    <!--<li data-ng-show="token"><a ng-href="#/restricted">Restricted area</a></li>--!>
                    <li data-ng-hide="token"><a ng-href="#/signin">Log in</a></li>
                    <li data-ng-hide="token"><a ng-href="#/signup">Sign up</a></li>
                    <li data-ng-show="token"><a ng-click="logout()">Logout</a></li>
                </ul>
            </div>
        </div>
<!--    </nav> -->
    </div>

    {{-- !! Request::Path() !! --}}

    @yield('content')

        <footer class="footer-distributed">

            <div class="footer-left">

                <h3>GIMT <span>by BitLess</span></h3>

                <p class="footer-links">
                    <a href="{{ url('/') }}">Home</a>
                    ·
                    <a href="{{ url('/about') }}">About</a>
                    ·
                    <a href="{{ url('/maps') }}">maps</a>
                </p>

                <p class="footer-company-name">GRB-Site &nocopy; 2016</p>
            </div>

            <div class="footer-center">
                <div>
                    <i class="fa fa-map-marker"></i>
                    <p><span>Damstraat 100, bus 4</span> 1982 Weerde, Belgium</p>
                </div>

                <div>
               <i class="fa fa-phone"></i>
                    <p>+32(0)498/88.93.51</p>
                </div>

                <div>
                    <i class="fa fa-envelope"></i>
                    <p><a href="mailto:info@bitless.be">info@bitless.be</a></p>
                </div>

                <div>
                    <i class="fa fa-key"></i>
                    <p><a href="store/0xDF1CA459.asc" download>Public key</a></p>
                </div>

            </div>

            <div class="footer-right">

                <p class="footer-company-about">
                    <span>About the company</span>
                    BitLess is a hardcore software data crunching, application design, code and system admininistration company. doing this for over 2 decades.
                </p>
                <div class="footer-icons2">
                            <a href="https://twitter.com/glenn_plas" class="btn btn-social-icon btn-lg btn-twitter" title="follow me on Twitter"><i class="fa fa-twitter"></i></a>
                            <a href="https://www.linkedin.com/in/glennplas" class="btn btn-social-icon btn-lg btn-linkedin" title="follow me on Linkedin"><i class="fa fa-linkedin"></i></a>
                            <a href="https://bitbucket.org/gplv2/grbtool" class="btn btn-social-icon btn-lg btn-bitbucket" title="fork me on Bitbucket"><i class="fa fa-bitbucket"></i></a>
                            <a href="https://github.com/gplv2" class="btn btn-social-icon btn-lg btn-github" title="follow me on Github"><i class="fa fa-github"></i></a>
                            <a href="http://stackoverflow.com/users/1417629/glenn-plas" class="btn btn-social-icon btn-lg btn-linkedin" title="See me in action on StackOverflow"><i class="fa fa-stack-overflow"></i></a>
                            <a href="http://gis.stackexchange.com/users/10746/glenn-plas" class="btn btn-social-icon btn-lg btn-linkedin" title="See me in action on StackExchange"><i class="fa fa-stack-exchange"></i></a>
                    <!-- <a href="https://twitter.com/glenn_plas"><i class="fa fa-twitter"></i></a> -->
                    <!-- <a href="https://www.linkedin.com/in/glennplas"><i class="fa fa-linkedin"></i></a> -->
                    <!-- <a href="https://github.com/gplv2"><i class="fa fa-github"></i></a> -->
                </div>
            </div>
            <p class="text-muted credit">
            <span style="text-align: left; float: left">&copy; 2016 - Made with NeoVIM</span> <span style="text-align: right; float: right">Powered by: <a href="http://laravel.com/" alt="Laravel 5.2">Laravel 5.2</a></span>
            </p>
        </footer>
    <!-- JavaScripts -->
    <script src="//code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
    <!-- <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>  -->
    <script src="css/bootstrap-3.3.6-dist/js/bootstrap.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.6/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.6/angular-route.min.js"></script>
    <!--<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.14/angular.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.14/angular-route.min.js"></script> -->
    <script src="/js/loading-bar.js"></script>
    <!-- Token storage -->
    <script src="//cdn.jsdelivr.net/ngstorage/0.3.11/ngStorage.min.js"></script>
    <!-- Application -->
    <script src="/js/app.js"></script>
    <script src="/js/controllers.js"></script>
    <script src="/js/services.js"></script>
   @yield('page-bottom-script')
</body>
</html>
