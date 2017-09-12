// // document.write("hey now brown cow");
// // bucky = null ;
// // document.write(bucky);

// var x = "john";
// var y = 24;
// document.write(x + " is what ");
// document.write(x + y);

// function funky(){
// 	alert("ouch");
// }

// function meetball(x){
// 	alert("I love meetball" + x);
// }

// function fuck(one , two){
// 	alert(one + "is better than " + two);
// }

// function yelp(a , b){
// 	var c = a + b;
// 	return c;
// }

// function dofirst(){
// 	document.write("日你个妈耶！");
// 	dosecond();
// }
// function dosecond(){
// 	document.write("我操你妈了隔壁");
// 	dofirst();
// }

// function start(){
// 	dofirst();
// 	dosecond();
// }

// var bucky = new person("Tayler Swift" , 24);
// var taylor = new person("Bucky Roberts" , 30);

// fuck = {name:"motherfucker" , age:24 };
// gohell = {name: "rinima" , age:36};

// document.write("I like this" + fuck.name + "I reall"+ 
// 	  gohell.name);

// var people = new Array("Fuck" , "NIrima" , "caonima" , "goushi");
// document.write(people[0]);

// var thing = new Array(3);
// thing[0] = 12;
// thing[1] = 1666;
// thing[2] = 45;
// document.write(thing[2]);

// var movie = new Array("Avatar" , "Good will hunting" , "Vanilla Sky");
// var string1 = movie.join("-");
// document.write("<br />" + string1);
// document.write(movie.pop());
// var pie = prompt("Enter your name:" , "");
// document.write( "<br />" + "Hello " + pie);
// var n = prompt("Enter the number" , "");
// var answer = Math.sqrt(n);
//  alert("The sqare root of " + n + " is " + answer);
// function dosomething(){
// 	var now = new Date();
// 	var hour = now.getHours();
// 	var min = now.getMinutes();
// 	var sec = now.getSeconds();
// 	document.write(hour + ":" + min + ":" + sec +":" + "<br />");
// }
// var x = document.forms[0].elements[0].name;
// document.write(x);
// document.write(x);
// function clickListener(){
// 	alert('I was clicked');
// }
// var h1 = document.getElementById('headline');
// if(h1.addEventListener){
// 	(h1.addEventListener){
// 		h1.addEventListener('click' , clickListener);
// 	}else if(h1.attachEvent){
// 		h1.attachEvent('onclick' , clickListener);
// 	}
// }
// var text = '{ "employees" : [' +
// '{ "firstName":"John" , "lastName":"Doe" },' +
// '{ "firstName":"Anna" , "lastName":"Smith" },' +
// '{ "firstName":"Peter" , "lastName":"Jones" } ]}';
// 	var obj = JSON.parse(text);
// document.getElementById("demo").innerHTML = obj.employees[1].firstName
// + " " + obj.employees[1].lastName;
// function myFuntion(a,b){
// 	return this;
// }
// document.getElementById("demo").innerHTML = myFuntion();
// document.write(window.myFuntion(2 ,10));
// var myObject = {
// 	firstName:"John",
// 	lastName : "Doe",
// 	fullName : function(){
// 		return this.firstName + " " + this.lastName;
// 	}
// }
// function myFunction(a ,b){
// 	return a*b;
// }
// var myArray = [10,2];
// var myObject = myFunction.apply(myObject,myArray);
// document.getElementById("demo").innerHTML = myObject;
// var counter = 0 ;
// function add(){
// 	return counter +=1;
// }

// function myFunction(){
// 	document.getElementById("demo").innerHTML = add();
// }
// function myMove(){
// 	var elem = document.getElementById("animate");
// 	var pos = 0;
// 	var id = setInterval(frame , 5);
// 	function frame(){
// 		if(pos == 350){
// 			clearInterval(id);
// 		} else{
// 			pos++;
// 			elem.style.top = pos +'px';
// 			elem.style.left = pos + 'px';
// 		}
// 	}
// }
// document.getElementById("myBtn").onclick = displayDate;
// function checkCookies(){
// 	var text = "";
// 	if(navigator.cookieEnabled == true){
// 		text = "Cookies are enabled."
// 	}else{
// 		text = "Cookies are not enabled.";
// 	}
// 	document.getElementById("demo").innerHTML = text;
// }

// function displayDate(){
// 	document.getElementById("demo").innerHTML = Date();
// }
// document.getElementById("myBtn").addEventListener("click", displayDate);

// function displayDate(){
// 	document.getElementById("demo").innerHTML = Date();
// }alert(document.body.innerHTML);
// var para = document.createElement("p");
// var node = document.createTextNode("This is new.");
// para.appendChild(node);
// var element = document.getElementById("div1");
// var child = document.getElementById("p1");
// element.insertBefore(para,child);
// document.getElementById("demo").innerHTML = navigator.javaEnabled();
// var app = angular.module("myApp",[]);
// app.directive("w3TestDirective" , function(){
// 	return{
// 		template:"I was made in a directive constructor!"
// 	};
// });