(function(){
    var app = angular.module("app", ['user', 'friend', 'post', 'ngSanitize']);
    app.controller('initController', ['$http', '$scope', '$rootScope', '$sce', function(h, s, rs, $sce){
        var auth = getCookie("auth");
        if (auth == null||auth == "login"){
            h.defaults.headers.common.auth = "login";
        }else{
            h.defaults.headers.common.auth = auth;
        }
        h.get("/status").success(function(data){
            if(!data.info){
                rs.user = data;
                if(window.location.hash == "#feed"){
                    rs.state = "feed";
                    h.get("/user/getnots").success(function(data){
                        if(data.err) return showErr(data.err);
                        rs.pag = {};
                        rs.pag.nots = {
                            unRead: data,
                            
                        };
                    });
                }else if (window.location.hash == "#home"){
                    rs.state = "home";
                    rs.pag = rs.user;
                    rs.pag.friends = 3;
                    h.get("/user/getposts/1/"+rs.user._id).success(function(data){
                        if(data.err)
                            return showErr(data.err);
                        rs.pag.posts = data;
                    });
                }else if(window.location.hash.search("@") != -1){
                    var slug = window.location.hash.split("/")[2];
                    var username = window.location.hash.slice((window.location.hash.search("@") + 1))
                    username = username.slice(0,username.search("/"));
                    h.get("/user/getone/"+username).success(function(user){
                        if(user.err) return showErr(user.err);
                        if(slug){
                            rs.state = "post";
                            h.get("/post/gettext/"+slug.split("-")[window.location.hash.split("/")[2].split("-").length-1]).success(function(data){
                                if(data.err) return showErr(data.err);
                                rs.pag = user;
                                rs.pag.content = data;
                                h.get("/post/get/"+slug.split("-")[window.location.hash.split("/")[2].split("-").length-1]).success(function(data){
                                    rs.pag.post = data;
                                    rs.pag.post.createdOn = moment(rs.pag.post.createdOn).format('LLL');
                                });
                            });
                        }else{
                            h.get("/user/getposts/1/"+user._id).success(function(posts){
                                if(posts.err)
                                    return showErr(posts.err);
                                rs.state = "user";
                                window.location.hash = "@"+username;
                                rs.pag = user;
                                rs.pag.posts = posts;
                                h.get("/friend/getstate/"+rs.user._id+"/"+user._id).success(function(state){
                                    rs.pag.friends = state.state;
                                });
                            });
                        }
                    });
                }
            }else{
                rs.state = "login";
                window.location.hash = "login";
            }
        });
        this.toHome = function(){
            $(window).scrollTop(0);
            h.get("/user/getposts/1/"+rs.user._id).success(function(data){
                if(data.err)
                    return showErr(data.err);
                rs.state = "home";
                window.location.hash = "home";
                rs.pag = rs.user;
                rs.pag.friends = 3;
                rs.pag.posts = data;
            });
        }
        this.toFeed = function(){
            $(window).scrollTop(0);
            if(!rs.pag) rs.pag = {}
            rs.pag.nots = {}
            rs.state = "feed";
            window.location.hash = "feed";
            h.get("/user/getnots").success(function(data){
                if(data.err) return showErr(data.err);
                rs.pag.nots = {
                    unRead: data
                };
            });
        }
        this.toUser = function(username){
            $(window).scrollTop(0);
            h.get("/user/getone/"+username).success(function(user){
                if(user.err) return showErr(user.err);
                h.get("/user/getposts/1/"+user._id).success(function(posts){
                    if(posts.err)
                        return showErr(posts.err);
                    rs.state = "user";
                    window.location.hash = "@"+username;
                    rs.pag = user;
                    rs.pag.posts = posts;
                    h.get("/friend/getstate/"+rs.user._id+"/"+user._id).success(function(state){
                        rs.pag.friends = state.state;
                    });
                });
            });
        }
        this.readNot = function(not){
            h.post("/not/read/"+not).success(function(data){
                if(data.err) return showErr(data.err);
                for (var i=0;i<rs.pag.nots.unRead.length;i++){
                    if(rs.pag.nots.unRead[i]._id == not){
                        rs.pag.nots.unRead[i].state = 1;
                        var obj = rs.pag.nots.unRead[i];
                        if(!rs.pag.nots.read)
                            rs.pag.nots.read = [obj];
                        rs.pag.nots.unRead.splice(i, 1);
                        break;
                    }
                }
            });
        }
        this.getOldNots = function(){
            h.get("/not/getold").success(function(data){
                if(data.err) return showErr(data.err);
                rs.pag.nots.read = data;
            });
        }
    }]);
})();