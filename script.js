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
		var oDiv4=document.getElementById('div4');
	var aLi4=getByClass(oDiv4, 'zns_box4_head')[0].getElementsByTagName('li');
	var aBtn4=getByClass(oDiv4, 'zns_box4_foot')[0].getElementsByTagName('a');
	var oCaret4=getByClass(oDiv4, 'caret4')[0];
	var aPos4=[];
	var timer4=null;
	var i4=0;
	
	for(i4=0;i4<aLi4.length;i4++)
	{
		aLi4[i4].index=i4;
		aPos4[i4]=aLi4[i4].offsetLeft;
	}
	
	for(i4=0;i4<aLi4.length;i4++)
	{
		aLi4[i4].style.position='absolute';
		aLi4[i4].style.left=aPos4[i4]+'px';
	}
	
	aBtn4[0].onclick=btn1Handler4;
	aBtn4[1].onclick=btn2Handler4;
	
	function btn1Handler4()
	{
		var i=aLi4.length-1;
		
		clearTimeout(timer4);
		aBtn4[0].onclick=null;
		aBtn4[1].onclick=null;
		
		function next()
		{
			var obj=aLi4[i];
			if(i>=aLi4.length/2)
			{
				znsStartMove(aLi4[i], {left: 900}, ZNS_MOVE_TYPE.FLEX);
				timer4=setTimeout(next, 100);
				i--;
			}
			else
			{
				timer4=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i>=0)
			{
				znsStartMove(aLi4[i], {left: aPos4[i]}, ZNS_MOVE_TYPE.FLEX);
				timer4=setTimeout(next2, 100);
			}
			
			i--;
			
			if(i==-1)
			{
				aBtn4[0].onclick=btn1Handler4;
				aBtn4[1].onclick=btn2Handler4;
			}
		}
		
		next();
		
		aBtn4[1].className='';
		this.className='show4';
		znsStartMove(oCaret4, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};

	function btn2Handler4()
	{
		var i=0;
		
		clearTimeout(timer4);
		aBtn4[0].onclick=null;
		aBtn4[1].onclick=null;
		
		function next()
		{
			var obj=aLi4[i];
			if(i<aLi4.length/2)
			{
				znsStartMove(aLi4[i], {left: -200}, ZNS_MOVE_TYPE.FLEX);
				timer4=setTimeout(next, 100);
				i++;
			}
			else if(i==aLi4.length/2)
			{
				timer4=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i<aLi4.length)
			{
				znsStartMove(aLi4[i], {left: aPos4[i-aLi4.length/2]}, ZNS_MOVE_TYPE.FLEX);
				timer4=setTimeout(next2, 100);
			}
			i++;
			
			if(i==aLi4.length)
			{
				aBtn4[0].onclick=btn1Handler4;
				aBtn4[1].onclick=btn2Handler4;
			}
		}
		
		next();
		
		aBtn4[0].className='';
		this.className='show4';
		znsStartMove(oCaret4, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};
		var oDiv5=document.getElementById('div5');
	var aLi5=getByClass(oDiv5, 'zns_box5_head')[0].getElementsByTagName('li');
	var aBtn5=getByClass(oDiv5, 'zns_box5_foot')[0].getElementsByTagName('a');
	var oCaret5=getByClass(oDiv5, 'caret5')[0];
	var aPos5=[];
	var timer5=null;
	var i5=0;
	
	for(i5=0;i5<aLi5.length;i5++)
	{
		aLi5[i5].index=i5;
		aPos5[i5]=aLi5[i5].offsetLeft;
	}
	
	for(i5=0;i5<aLi5.length;i5++)
	{
		aLi5[i5].style.position='absolute';
		aLi5[i5].style.left=aPos5[i5]+'px';
	}
	
	aBtn5[0].onclick=btn1Handler5;
	aBtn5[1].onclick=btn2Handler5;
	
	function btn1Handler5()
	{
		var i=aLi5.length-1;
		
		clearTimeout(timer5);
		aBtn5[0].onclick=null;
		aBtn5[1].onclick=null;
		
		function next()
		{
			var obj=aLi5[i];
			if(i>=aLi5.length/2)
			{
				znsStartMove(aLi5[i], {left: 900}, ZNS_MOVE_TYPE.FLEX);
				timer5=setTimeout(next, 100);
				i--;
			}
			else
			{
				timer5=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i>=0)
			{
				znsStartMove(aLi5[i], {left: aPos5[i]}, ZNS_MOVE_TYPE.FLEX);
				timer5=setTimeout(next2, 100);
			}
			
			i--;
			
			if(i==-1)
			{
				aBtn5[0].onclick=btn1Handler5;
				aBtn5[1].onclick=btn2Handler5;
			}
		}
		
		next();
		
		aBtn5[1].className='';
		this.className='show5';
		znsStartMove(oCaret5, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};

	function btn2Handler5()
	{
		var i=0;
		
		clearTimeout(timer5);
		aBtn5[0].onclick=null;
		aBtn5[1].onclick=null;
		
		function next()
		{
			var obj=aLi5[i];
			if(i<aLi5.length/2)
			{
				znsStartMove(aLi5[i], {left: -200}, ZNS_MOVE_TYPE.FLEX);
				timer5=setTimeout(next, 100);
				i++;
			}
			else if(i==aLi5.length/2)
			{
				timer5=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i<aLi5.length)
			{
				znsStartMove(aLi5[i], {left: aPos5[i-aLi5.length/2]}, ZNS_MOVE_TYPE.FLEX);
				timer5=setTimeout(next2, 100);
			}
			i++;
			
			if(i==aLi5.length)
			{
				aBtn5[0].onclick=btn1Handler5;
				aBtn5[1].onclick=btn2Handler5;
			}
		}
		
		next();
		
		aBtn5[0].className='';
		this.className='show5';
		znsStartMove(oCaret5, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};
		var oDiv6=document.getElementById('div6');
	var aLi6=getByClass(oDiv6, 'zns_box6_head')[0].getElementsByTagName('li');
	var aBtn6=getByClass(oDiv6, 'zns_box6_foot')[0].getElementsByTagName('a');
	var oCaret6=getByClass(oDiv6, 'caret6')[0];
	var aPos6=[];
	var timer6=null;
	var i6=0;
	
	for(i6=0;i6<aLi6.length;i6++)
	{
		aLi6[i6].index=i6;
		aPos6[i6]=aLi6[i6].offsetLeft;
	}
	
	for(i6=0;i6<aLi6.length;i6++)
	{
		aLi6[i6].style.position='absolute';
		aLi6[i6].style.left=aPos6[i6]+'px';
	}
	
	aBtn6[0].onclick=btn1Handler6;
	aBtn6[1].onclick=btn2Handler6;
	
	function btn1Handler6()
	{
		var i=aLi6.length-1;
		
		clearTimeout(timer6);
		aBtn6[0].onclick=null;
		aBtn6[1].onclick=null;
		
		function next()
		{
			var obj=aLi6[i];
			if(i>=aLi6.length/2)
			{
				znsStartMove(aLi6[i], {left: 900}, ZNS_MOVE_TYPE.FLEX);
				timer6=setTimeout(next, 100);
				i--;
			}
			else
			{
				timer6=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i>=0)
			{
				znsStartMove(aLi6[i], {left: aPos6[i]}, ZNS_MOVE_TYPE.FLEX);
				timer6=setTimeout(next2, 100);
			}
			
			i--;
			
			if(i==-1)
			{
				aBtn6[0].onclick=btn1Handler6;
				aBtn6[1].onclick=btn2Handler6;
			}
		}
		
		next();
		
		aBtn6[1].className='';
		this.className='show6';
		znsStartMove(oCaret6, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};

	function btn2Handler6()
	{
		var i=0;
		
		clearTimeout(timer6);
		aBtn6[0].onclick=null;
		aBtn6[1].onclick=null;
		
		function next()
		{
			var obj=aLi6[i];
			if(i<aLi6.length/2)
			{
				znsStartMove(aLi6[i], {left: -200}, ZNS_MOVE_TYPE.FLEX);
				timer6=setTimeout(next, 100);
				i++;
			}
			else if(i==aLi6.length/2)
			{
				timer6=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i<aLi6.length)
			{
				znsStartMove(aLi6[i], {left: aPos6[i-aLi6.length/2]}, ZNS_MOVE_TYPE.FLEX);
				timer6=setTimeout(next2, 100);
			}
			i++;
			
			if(i==aLi6.length)
			{
				aBtn6[0].onclick=btn1Handler6;
				aBtn6[1].onclick=btn2Handler6;
			}
		}
		
		next();
		
		aBtn6[0].className='';
		this.className='show6';
		znsStartMove(oCaret6, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};
		var oDiv6=document.getElementById('div6');
	var aLi6=getByClass(oDiv6, 'zns_box6_head')[0].getElementsByTagName('li');
	var aBtn6=getByClass(oDiv6, 'zns_box6_foot')[0].getElementsByTagName('a');
	var oCaret6=getByClass(oDiv6, 'caret6')[0];
	var aPos6=[];
	var timer6=null;
	var i6=0;
	
	for(i6=0;i6<aLi6.length;i6++)
	{
		aLi6[i6].index=i6;
		aPos6[i6]=aLi6[i6].offsetLeft;
	}
	
	for(i6=0;i6<aLi6.length;i6++)
	{
		aLi6[i6].style.position='absolute';
		aLi6[i6].style.left=aPos6[i6]+'px';
	}
	
	aBtn6[0].onclick=btn1Handler6;
	aBtn6[1].onclick=btn2Handler6;
	
	function btn1Handler6()
	{
		var i=aLi6.length-1;
		
		clearTimeout(timer6);
		aBtn6[0].onclick=null;
		aBtn6[1].onclick=null;
		
		function next()
		{
			var obj=aLi6[i];
			if(i>=aLi6.length/2)
			{
				znsStartMove(aLi6[i], {left: 900}, ZNS_MOVE_TYPE.FLEX);
				timer6=setTimeout(next, 100);
				i--;
			}
			else
			{
				timer6=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i>=0)
			{
				znsStartMove(aLi7[i], {left: aPos7[i]}, ZNS_MOVE_TYPE.FLEX);
				timer7=setTimeout(next2, 100);
			}
			
			i--;
			
			if(i==-1)
			{
				aBtn7[0].onclick=btn1Handler7;
				aBtn7[1].onclick=btn2Handler7;
			}
		}
		
		next();
		
		aBtn7[1].className='';
		this.className='show7';
		znsStartMove(oCaret7, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};

	function btn2Handler7()
	{
		var i=0;
		
		clearTimeout(timer7);
		aBtn7[0].onclick=null;
		aBtn7[1].onclick=null;
		
		function next()
		{
			var obj=aLi7[i];
			if(i<aLi7.length/2)
			{
				znsStartMove(aLi7[i], {left: -200}, ZNS_MOVE_TYPE.FLEX);
				timer7=setTimeout(next, 100);
				i++;
			}
			else if(i==aLi7.length/2)
			{
				timer7=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i<aLi7.length)
			{
				znsStartMove(aLi7[i], {left: aPos7[i-aLi7.length/2]}, ZNS_MOVE_TYPE.FLEX);
				timer7=setTimeout(next2, 100);
			}
			i++;
			
			if(i==aLi7.length)
			{
				aBtn7[0].onclick=btn1Handler7;
				aBtn7[1].onclick=btn2Handler7;
			}
		}
		
		next();
		
		aBtn7[0].className='';
		this.className='show7';
		znsStartMove(oCaret7, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};
		var oDiv6=document.getElementById('div6');
	var aLi6=getByClass(oDiv6, 'zns_box6_head')[0].getElementsByTagName('li');
	var aBtn6=getByClass(oDiv6, 'zns_box6_foot')[0].getElementsByTagName('a');
	var oCaret6=getByClass(oDiv6, 'caret6')[0];
	var aPos6=[];
	var timer6=null;
	var i6=0;
	
	for(i6=0;i6<aLi6.length;i6++)
	{
		aLi6[i6].index=i6;
		aPos6[i6]=aLi6[i6].offsetLeft;
	}
	
	for(i6=0;i6<aLi6.length;i6++)
	{
		aLi6[i6].style.position='absolute';
		aLi6[i6].style.left=aPos6[i6]+'px';
	}
	
	aBtn6[0].onclick=btn1Handler6;
	aBtn6[1].onclick=btn2Handler6;
	
	function btn1Handler6()
	{
		var i=aLi6.length-1;
		
		clearTimeout(timer6);
		aBtn6[0].onclick=null;
		aBtn6[1].onclick=null;
		
		function next()
		{
			var obj=aLi6[i];
			if(i>=aLi6.length/2)
			{
				znsStartMove(aLi6[i], {left: 900}, ZNS_MOVE_TYPE.FLEX);
				timer6=setTimeout(next, 100);
				i--;
			}
			else
			{
				timer6=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i>=0)
			{
				znsStartMove(aLi8[i], {left: aPos8[i]}, ZNS_MOVE_TYPE.FLEX);
				timer8=setTimeout(next2, 100);
			}
			
			i--;
			
			if(i==-1)
			{
				aBtn8[0].onclick=btn1Handler8;
				aBtn8[1].onclick=btn2Handler8;
			}
		}
		
		next();
		
		aBtn8[1].className='';
		this.className='show8';
		znsStartMove(oCaret8, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};

	function btn2Handler8()
	{
		var i=0;
		
		clearTimeout(timer8);
		aBtn8[0].onclick=null;
		aBtn8[1].onclick=null;
		
		function next()
		{
			var obj=aLi8[i];
			if(i<aLi8.length/2)
			{
				znsStartMove(aLi8[i], {left: -200}, ZNS_MOVE_TYPE.FLEX);
				timer8=setTimeout(next, 100);
				i++;
			}
			else if(i==aLi8.length/2)
			{
				timer8=setTimeout(next2, 150);
			}
		}
		
		function next2()
		{
			if(i<aLi8.length)
			{
				znsStartMove(aLi8[i], {left: aPos8[i-aLi8.length/2]}, ZNS_MOVE_TYPE.FLEX);
				timer8=setTimeout(next2, 100);
			}
			i++;
			
			if(i==aLi8.length)
			{
				aBtn8[0].onclick=btn1Handler8;
				aBtn8[1].onclick=btn2Handler8;
			}
		}
		
		next();
		
		aBtn8[0].className='';
		this.className='show8';
		znsStartMove(oCaret8, {left: this.offsetLeft+this.offsetWidth/2}, ZNS_MOVE_TYPE.BUFFER);
	};
};
