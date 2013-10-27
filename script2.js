function css(obj, attr, value)
{
	if(arguments.length==2)
		return parseFloat(obj.currentStyle?obj.currentStyle[attr]:document.defaultView.getComputedStyle(obj, false)[attr]);
	else if(arguments.length==3)
		switch(attr)
		{
			case 'width':
			case 'height':
			case 'paddingLeft':
			case 'paddingTop':
			case 'paddingRight':
			case 'paddingBottom':
				value=Math.max(value,0);
			case 'left':
			case 'top':
			case 'marginLeft':
			case 'marginTop':
			case 'marginRight':
			case 'marginBottom':
				obj.style[attr]=value+'px';
				break;
			case 'opacity':
				obj.style.filter="alpha(opacity:"+value*100+")";
				obj.style.opacity=value;
				break;
			default:
				obj.style[attr]=value;
		}
	
	return function (attr_in, value_in){css(obj, attr_in, value_in)};
}

var ZNS_MOVE_TYPE={
	BUFFER: 1,
	FLEX: 2
};

function znsStartMove(obj, oTarget, iType, fnCallBack, fnDuring)
{
	var fnMove=null;
	if(obj.timer)
	{
		clearInterval(obj.timer);
	}
	
	switch(iType)
	{
		case ZNS_MOVE_TYPE.BUFFER:
			fnMove=znsDoMoveBuffer;
			break;
		case ZNS_MOVE_TYPE.FLEX:
			fnMove=znsDoMoveFlex;
			break;
	}
	
	obj.timer=setInterval(function (){
		fnMove(obj, oTarget, fnCallBack, fnDuring);
	}, 15);
}

function znsDoMoveBuffer(obj, oTarget, fnCallBack, fnDuring)
{
	var bStop=true;
	var attr='';
	var speed=0;
	var cur=0;
	
	for(attr in oTarget)
	{
		cur=css(obj, attr);
		if(oTarget[attr]!=cur)
		{
			bStop=false;
			
			speed=(oTarget[attr]-cur)/5;
			speed=speed>0?Math.ceil(speed):Math.floor(speed);
			
			css(obj, attr, cur+speed);
		}
	}
	
	if(fnDuring)fnDuring.call(obj);
	
	if(bStop)
	{
		clearInterval(obj.timer);
		obj.timer=null;
		
		if(fnCallBack)fnCallBack.call(obj);
	}
}

function znsDoMoveFlex(obj, oTarget, fnCallBack, fnDuring)
{
	var bStop=true;
	var attr='';
	var speed=0;
	var cur=0;
	
	for(attr in oTarget)
	{
		if(!obj.oSpeed)obj.oSpeed={};
		if(!obj.oSpeed[attr])obj.oSpeed[attr]=0;
		cur=css(obj, attr);
		if(Math.abs(oTarget[attr]-cur)>1 || Math.abs(obj.oSpeed[attr])>1)
		{
			bStop=false;
			
			obj.oSpeed[attr]+=(oTarget[attr]-cur)/5;
			obj.oSpeed[attr]*=0.7;
			var maxSpeed=65;
			if(Math.abs(obj.oSpeed[attr])>maxSpeed)
			{
				obj.oSpeed[attr]=obj.oSpeed[attr]>0?maxSpeed:-maxSpeed;
			}
			
			css(obj, attr, cur+obj.oSpeed[attr]);
		}
	}
	
	if(fnDuring)fnDuring.call(obj);
	
	if(bStop)
	{
		clearInterval(obj.timer);
		obj.timer=null;
		if(fnCallBack)fnCallBack.call(obj);
	}
}

function getByClass(oParent, sClass)
{
	var aEle=oParent.getElementsByTagName('*');
	var aResult=[];
	var i=0;
	
	for(i=0;i<aEle.length;i++)
	{
		if(aEle[i].className==sClass)
		{
			aResult.push(aEle[i]);
		}
	}
	
	return aResult;
}

window.onload=function ()
{
	var oDiv=document.getElementById('div1');
	var aLi=getByClass(oDiv, 'zns_box_head')[0].getElementsByTagName('li');
	var aBtn=getByClass(oDiv, 'zns_box_foot')[0].getElementsByTagName('a');
	var oCaret=getByClass(oDiv, 'caret')[0];
	var aPos=[];
	var timer=null;
	var i=0;
	
	for(i=0;i<aLi.length;i++)
	{
		aLi[i].index=i;
		aPos[i]=aLi[i].offsetLeft;
	}
	
	for(i=0;i<aLi.length;i++)
	{
		aLi[i].style.position='absolute';
		aLi[i].style.left=aPos[i]+'px';
	}
	
	aBtn[0].onclick=btn1Handler;
	aBtn[1].onclick=btn2Handler;
	
	function btn1Handler()
	{
		var i=aLi.length-1;
		
		clearTimeout(timer);
		aBtn[0].onclick=null;
		aBtn[1].onclick=null;
		
		function next()
		{
			var obj=aLi[i];
			if(i>=aLi.length/2)
			{
				znsStartMove(aLi[i], {left: 900}, ZNS_MOVE_TYPE.FLEX);
				timer=setTimeout(next, 100);
				i--;
			}
			else
			{
				timer=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i>=0)
			{
				znsStartMove(aLi[i], {left: aPos[i]}, ZNS_MOVE_TYPE.FLEX);
				timer=setTimeout(next2, 100);
			}
			
			i--;
			
			if(i==-1)
			{
				aBtn[0].onclick=btn1Handler;
				aBtn[1].onclick=btn2Handler;
			}
		}
		
		next();
		
		aBtn[1].className='';
		this.className='show';
		znsStartMove(oCaret, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};

	function btn2Handler()
	{
		var i=0;
		
		clearTimeout(timer);
		aBtn[0].onclick=null;
		aBtn[1].onclick=null;
		
		function next()
		{
			var obj=aLi[i];
			if(i<aLi.length/2)
			{
				znsStartMove(aLi[i], {left: -200}, ZNS_MOVE_TYPE.FLEX);
				timer=setTimeout(next, 100);
				i++;
			}
			else if(i==aLi.length/2)
			{
				timer=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i<aLi.length)
			{
				znsStartMove(aLi[i], {left: aPos[i-aLi.length/2]}, ZNS_MOVE_TYPE.FLEX);
				timer=setTimeout(next2, 100);
			}
			i++;
			
			if(i==aLi.length)
			{
				aBtn[0].onclick=btn1Handler;
				aBtn[1].onclick=btn2Handler;
			}
		}
		
		next();
		
		aBtn[0].className='';
		this.className='show';
		znsStartMove(oCaret, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};
	var oDiv2=document.getElementById('div2');
	var aLi2=getByClass(oDiv2, 'zns_box2_head')[0].getElementsByTagName('li');
	var aBtn2=getByClass(oDiv2, 'zns_box2_foot')[0].getElementsByTagName('a');
	var oCaret2=getByClass(oDiv2, 'caret2')[0];
	var aPos2=[];
	var timer2=null;
	var i2=0;
	
	for(i2=0;i2<aLi2.length;i2++)
	{
		aLi2[i2].index=i2;
		aPos2[i2]=aLi2[i2].offsetLeft;
	}
	
	for(i2=0;i2<aLi2.length;i2++)
	{
		aLi2[i2].style.position='absolute';
		aLi2[i2].style.left=aPos2[i2]+'px';
	}
	
	aBtn2[0].onclick=btn1Handler2;
	aBtn2[1].onclick=btn2Handler2;
	
	function btn1Handler2()
	{
		var i=aLi2.length-1;
		
		clearTimeout(timer2);
		aBtn2[0].onclick=null;
		aBtn2[1].onclick=null;
		
		function next()
		{
			var obj=aLi2[i];
			if(i>=aLi2.length/2)
			{
				znsStartMove(aLi2[i], {left: 900}, ZNS_MOVE_TYPE.FLEX);
				timer2=setTimeout(next, 100);
				i--;
			}
			else
			{
				timer2=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i>=0)
			{
				znsStartMove(aLi2[i], {left: aPos2[i]}, ZNS_MOVE_TYPE.FLEX);
				timer2=setTimeout(next2, 100);
			}
			
			i--;
			
			if(i==-1)
			{
				aBtn2[0].onclick=btn1Handler2;
				aBtn2[1].onclick=btn2Handler2;
			}
		}
		
		next();
		
		aBtn2[1].className='';
		this.className='show2';
		znsStartMove(oCaret2, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};

	function btn2Handler2()
	{
		var i=0;
		
		clearTimeout(timer2);
		aBtn2[0].onclick=null;
		aBtn2[1].onclick=null;
		
		function next()
		{
			var obj=aLi2[i];
			if(i<aLi2.length/2)
			{
				znsStartMove(aLi2[i], {left: -200}, ZNS_MOVE_TYPE.FLEX);
				timer2=setTimeout(next, 100);
				i++;
			}
			else if(i==aLi2.length/2)
			{
				timer2=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i<aLi2.length)
			{
				znsStartMove(aLi2[i], {left: aPos2[i-aLi2.length/2]}, ZNS_MOVE_TYPE.FLEX);
				timer2=setTimeout(next2, 100);
			}
			i++;
			
			if(i==aLi2.length)
			{
				aBtn2[0].onclick=btn1Handler2;
				aBtn2[1].onclick=btn2Handler2;
			}
		}
		
		next();
		
		aBtn2[0].className='';
		this.className='show2';
		znsStartMove(oCaret2, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};
var oDiv3=document.getElementById('div3');
	var aLi3=getByClass(oDiv3, 'zns_box3_head')[0].getElementsByTagName('li');
	var aBtn3=getByClass(oDiv3, 'zns_box3_foot')[0].getElementsByTagName('a');
	var oCaret3=getByClass(oDiv3, 'caret3')[0];
	var aPos3=[];
	var timer3=null;
	var i3=0;
	
	for(i3=0;i3<aLi3.length;i3++)
	{
		aLi3[i3].index=i3;
		aPos3[i3]=aLi3[i3].offsetLeft;
	}
	
	for(i3=0;i3<aLi3.length;i3++)
	{
		aLi3[i3].style.position='absolute';
		aLi3[i3].style.left=aPos3[i3]+'px';
	}
	
	aBtn3[0].onclick=btn1Handler3;
	aBtn3[1].onclick=btn2Handler3;
	
	function btn1Handler3()
	{
		var i=aLi3.length-1;
		
		clearTimeout(timer3);
		aBtn3[0].onclick=null;
		aBtn3[1].onclick=null;
		
		function next()
		{
			var obj=aLi3[i];
			if(i>=aLi3.length/2)
			{
				znsStartMove(aLi3[i], {left: 900}, ZNS_MOVE_TYPE.FLEX);
				timer3=setTimeout(next, 100);
				i--;
			}
			else
			{
				timer3=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i>=0)
			{
				znsStartMove(aLi3[i], {left: aPos3[i]}, ZNS_MOVE_TYPE.FLEX);
				timer3=setTimeout(next2, 100);
			}
			
			i--;
			
			if(i==-1)
			{
				aBtn3[0].onclick=btn1Handler3;
				aBtn3[1].onclick=btn2Handler3;
			}
		}
		
		next();
		
		aBtn3[1].className='';
		this.className='show3';
		znsStartMove(oCaret3, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};

	function btn2Handler3()
	{
		var i=0;
		
		clearTimeout(timer3);
		aBtn3[0].onclick=null;
		aBtn3[1].onclick=null;
		
		function next()
		{
			var obj=aLi3[i];
			if(i<aLi3.length/2)
			{
				znsStartMove(aLi3[i], {left: -200}, ZNS_MOVE_TYPE.FLEX);
				timer3=setTimeout(next, 100);
				i++;
			}
			else if(i==aLi3.length/2)
			{
				timer3=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i<aLi3.length)
			{
				znsStartMove(aLi3[i], {left: aPos3[i-aLi3.length/2]}, ZNS_MOVE_TYPE.FLEX);
				timer3=setTimeout(next2, 100);
			}
			i++;
			
			if(i==aLi3.length)
			{
				aBtn3[0].onclick=btn1Handler3;
				aBtn3[1].onclick=btn2Handler3;
			}
		}
		
		next();
		
		aBtn3[0].className='';
		this.className='show3';
		znsStartMove(oCaret3, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};
};
