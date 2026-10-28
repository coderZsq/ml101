// 课程从零开始：每节只使用前面已经接触过的概念。
const question = (q, opts, answer, fb) => ({ q, opts, answer, fb });
function speedExperiment(root) {
  root.innerHTML = `<div class="callout"><b>① 拖动小车，看看它的位置和速度</b><p><label>时间 <input class="time" type="range" min="0" max="4" step="0.1" value="2"></label></p><div class="formula position" aria-live="polite"></div><canvas style="width:100%;height:130px" aria-label="小车在路上的位置"></canvas><p>② 缩短观察时间，比较平均速度</p><label>观察时长 <input class="duration" type="range" min="0.1" max="2" step="0.1" value="2"></label><div class="formula average" aria-live="polite"></div><p class="hint"></p></div>`;
  const time=root.querySelector('.time'), duration=root.querySelector('.duration'), canvas=root.querySelector('canvas');
  function draw(){
    const t=+time.value, dt=+duration.value, distance=x=>x*x, start=distance(t), end=distance(t+dt), average=(end-start)/dt, now=2*t;
    root.querySelector('.position').textContent=`${t.toFixed(1)} 秒时：走了 ${start.toFixed(1)} 米　🚗 此刻速度 ${now.toFixed(1)} 米/秒`;
    root.querySelector('.average').textContent=`接下来 ${dt.toFixed(1)} 秒走了 ${(end-start).toFixed(2)} 米 → 平均每秒 ${(average).toFixed(2)} 米`;
    root.querySelector('.hint').textContent=`把观察时长向左拖短：平均速度 ${average.toFixed(2)} 越来越接近速度表上的 ${now.toFixed(1)}。这个“此刻速度”就是距离对时间的导数。`;
    const w=canvas.clientWidth||260,h=130,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const left=20,right=w-20, x=v=>left+(right-left)*v/36;
    c.strokeStyle='#888888';c.lineWidth=4;c.beginPath();c.moveTo(left,90);c.lineTo(right,90);c.stroke();c.fillStyle='#ededed';c.fillRect(x(start),55,Math.max(2,x(end)-x(start)),8);c.font='28px sans-serif';c.fillText('🚗',Math.max(0,x(start)-14),80);c.fillStyle='#dedede';c.font='12px sans-serif';c.fillText('起点',left,115);c.textAlign='right';c.fillText('36 米',right,115);
  }
  time.addEventListener('input',draw);duration.addEventListener('input',draw);draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function modelExperiment(kind) {
  return root => {
    root.innerHTML = `<div class="callout"><b class="task"></b><p><label>每件价格 <input type="range" min="0" max="8" step="0.5" value="2" aria-label="每件价格"></label></p><div class="formula result" aria-live="polite"></div><div class="model-scene" style="font-size:22px;line-height:2;text-align:center"></div><p class="hint"></p></div>`;
    const slider=root.querySelector('input');
    function draw(){
      const price=Number(slider.value), predicted=price*3, actual=12, error=predicted-actual;
      root.querySelector('.task').textContent=kind==='prediction'?'任务：把每件价格调到 4，看看三件的预测总价':'任务：调整每件价格，让预测与实际价格一致';
      root.querySelector('.result').textContent=kind==='prediction'?`3 件 × ${price} 元 = 预测 ${predicted} 元`:`预测 ${predicted} 元 − 实际 12 元 = 误差 ${error} 元`;
      root.querySelector('.model-scene').textContent=`🍎 + 🍎 + 🍎　→　${predicted} 元${kind==='error'?'　｜　实际 12 元':''}`;
      root.querySelector('.hint').textContent=kind==='prediction'?'每件价格就是可以调整的参数；数量乘价格，得到预测。':error===0?'预测和实际一样：误差为 0。':error<0?'预测比实际低，试着提高每件价格。':'预测比实际高，试着降低每件价格。';
    }
    slider.addEventListener('input',draw);draw();
  };
}
function lossExperiment(kind) {
  return root => {
    root.innerHTML = `<div class="callout"><b class="task"></b><p><label>预测值 <input type="range" min="0" max="10" step="1" value="5" aria-label="预测值"></label></p><div class="formula result" aria-live="polite"></div><div class="model-scene" style="font-size:20px;line-height:2;text-align:center"></div><p class="hint"></p></div>`;
    const slider=root.querySelector('input');
    function draw(){
      const p=+slider.value, e1=p-3, e2=p-7, loss=(e1*e1+e2*e2)/2;
      root.querySelector('.task').textContent=kind==='cancel'?'任务：把预测调到 5，看看两个误差相加':'任务：调整预测值，让平均平方误差尽可能小';
      root.querySelector('.result').textContent=kind==='cancel'?`误差 ${e1>0?'+':''}${e1} + ${e2>0?'+':''}${e2} = ${e1+e2}`:`((${e1})² + (${e2})²) ÷ 2 = ${loss.toFixed(1)}`;
      root.querySelector('.model-scene').textContent=`实际 3　←　预测 ${p}　→　实际 7`;
      root.querySelector('.hint').textContent=kind==='cancel'?'正负误差可能互相抵消：相加为 0 不代表两个预测都正确。':`先分别平方，负号不会抵消；再取平均。当前损失 ${loss.toFixed(1)}。`;
    }
    slider.addEventListener('input',draw);draw();
  };
}
function trainingExperiment(root) {
  root.innerHTML = `<div class="callout"><b>任务：点击一步，观察预测和损失</b><p><label>步长 <input class="rate" type="range" min="0.1" max="1.2" step="0.1" value="0.3"></label> <span class="rate-value"></span></p><div class="formula state" aria-live="polite"></div><canvas style="width:100%;height:250px" aria-label="损失曲线与当前预测"></canvas><p class="explain"></p><button class="btn btn-primary step">走一步</button> <button class="btn btn-ghost reset">重新开始</button></div>`;
  const slider=root.querySelector('.rate'), canvas=root.querySelector('canvas');let p=9, steps=0;
  const loss=x=>((x-3)**2+(x-7)**2)/2;
  function draw(){
    const lr=+slider.value, slope=2*(p-5);root.querySelector('.rate-value').textContent=lr.toFixed(1);
    root.querySelector('.state').textContent=`第 ${steps} 步　预测 ${p.toFixed(2)}　损失 ${loss(p).toFixed(2)}`;
    root.querySelector('.explain').textContent=`当前位置的导数 ${slope.toFixed(2)}。下一步：预测 − 步长 × 导数 = ${(p-lr*slope).toFixed(2)}。`;
    const w=canvas.clientWidth||260,h=250,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);
    const size=Math.min(w-65,h-50),left=40+(w-65-size)/2,bottom=h-30,X=x=>left+(x+10)*size/30,Y=y=>bottom-y*size/30;
    c.strokeStyle='#888888';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#bdbdbd';c.font='11px sans-serif';c.textAlign='center';
    for(let v=-10;v<=20;v+=5){c.fillText(String(v),X(v),bottom+15);c.beginPath();c.moveTo(X(v),bottom);c.lineTo(X(v),bottom+4);c.stroke();}c.textAlign='right';for(let v=5;v<=30;v+=5)c.fillText(String(v),left-6,Y(v)+4);c.textAlign='left';c.fillText('损失',left+4,bottom-size+12);c.textAlign='right';c.fillText('预测',left+size,h-2);
    c.strokeStyle='#ededed';c.lineWidth=2;c.beginPath();for(let i=0;i<=100;i++){const x=i/10;i?c.lineTo(X(x),Y(loss(x))):c.moveTo(X(x),Y(loss(x)));}c.stroke();
    if(p>=-10&&p<=20&&loss(p)<=30){c.fillStyle='#f1bc68';c.beginPath();c.arc(X(p),Y(loss(p)),6,0,Math.PI*2);c.fill();}
    else {root.querySelector('.explain').textContent += ' 点已跑出图的范围；试试较小的步长或重新开始。';}
  }
  root.querySelector('.step').addEventListener('click',()=>{p-=Number(slider.value)*2*(p-5);steps++;draw();});root.querySelector('.reset').addEventListener('click',()=>{p=9;steps=0;draw();});slider.addEventListener('input',draw);draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function cycleExperiment(root) {
  root.innerHTML = `<div class="callout"><b>任务：每次点击，完成训练循环中的一步</b><div class="formula phase" aria-live="polite"></div><canvas class="cycle-chart" style="width:100%;height:340px" aria-label="训练过程：预测、误差和损失曲线"></canvas><p class="hint"></p><button class="btn btn-primary next">下一步</button> <button class="btn btn-ghost reset">重新开始</button></div>`;
  let prediction=9, phase=0, rounds=0, gradient=0;
  const loss=x=>((x-3)**2+(x-7)**2)/2;
  function draw(){
    const names=['① 预测','② 计算损失','③ 看导数','④ 更新预测'];
    root.querySelector('.phase').textContent=`第 ${rounds+1} 轮 · ${names[phase]}`;
    const canvas=root.querySelector('.cycle-chart'), w=canvas.clientWidth||300, h=340, dpr=window.devicePixelRatio||1;
    canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);
    const center=w/2, size=Math.min(w-80,180), left=center-size/2, bottom=300, X=x=>left+(x+10)*size/30, Y=y=>bottom-y*size/30;
    c.font='13px sans-serif';c.fillStyle='#d0d0d0';c.textAlign='center';c.fillText('实际值与预测',center,20);
    const px=x=>left+x*size/10;
    c.strokeStyle='#6c8070';c.lineWidth=2;c.beginPath();c.moveTo(left,70);c.lineTo(left+size,70);c.stroke();
    for(const value of [3,7]){c.fillStyle='#ededed';c.beginPath();c.arc(px(value),70,6,0,Math.PI*2);c.fill();c.fillText(`实际 ${value}`,px(value),52);}
    c.fillStyle='#f1bc68';c.beginPath();c.arc(px(prediction),100,7,0,Math.PI*2);c.fill();c.fillText(`预测 ${prediction.toFixed(2)}`,px(prediction),125);
    if(phase===1){c.strokeStyle='#ef9981';c.lineWidth=2;for(const value of [3,7]){c.beginPath();c.moveTo(px(prediction),100);c.lineTo(px(value),70);c.stroke();}c.fillStyle='#ef9981';c.fillText(`损失 ${loss(prediction).toFixed(2)}`,center,151);}
    c.strokeStyle='#888888';c.lineWidth=1;c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#bdbdbd';c.font='11px sans-serif';c.textAlign='center';for(let v=-10;v<=20;v+=5)c.fillText(String(v),X(v),bottom+14);c.textAlign='right';for(let v=5;v<=30;v+=5)c.fillText(String(v),left-6,Y(v)+4);c.textAlign='left';c.fillText('损失',left+4,bottom-size+12);c.textAlign='right';c.fillText('预测',left+size,bottom+28);
    c.strokeStyle='#ededed';c.lineWidth=2;c.beginPath();for(let i=0;i<=100;i++){const x=i/10;i?c.lineTo(X(x),Y(loss(x))):c.moveTo(X(x),Y(loss(x)));}c.stroke();
    c.fillStyle='#f1bc68';c.beginPath();c.arc(X(prediction),Y(loss(prediction)),6,0,Math.PI*2);c.fill();
    if(phase>=2 && Math.abs(gradient)>0.01){const target=prediction-0.3*gradient;c.strokeStyle='#f1bc68';c.lineWidth=2;c.beginPath();c.moveTo(X(prediction),Y(loss(prediction)));c.lineTo(X(target),Y(loss(target)));c.stroke();c.fillStyle='#f1bc68';c.beginPath();c.arc(X(target),Y(loss(target)),4,0,Math.PI*2);c.fill();}
    root.querySelector('.hint').textContent=['先用当前参数做预测。','计算每个误差的平方，再取平均。','导数描述损失在当前位置的变化方向。','减去步长乘导数，得到下一轮的新预测。'][phase];
  }
  root.querySelector('.next').addEventListener('click',()=>{if(phase===1)gradient=2*(prediction-5);if(phase===3){prediction-=0.3*gradient;rounds++;}phase=(phase+1)%4;draw();});
  root.querySelector('.reset').addEventListener('click',()=>{prediction=9;phase=0;rounds=0;gradient=0;draw();});draw();const observer=new ResizeObserver(()=>{if(!root.isConnected){observer.disconnect();return;}draw();});observer.observe(root.querySelector('.cycle-chart'));
}
function lineModel(root, withBase = false) {
  root.innerHTML=`<div class="callout"><b>任务：拖动单价，让预测线靠近三个实际价格</b><p><label>单价 <input type="range" min="0" max="4" step="0.1" value="1" aria-label="单价"></label></p><p class="base-control" hidden><label>基础费用 <input class="base" type="range" min="0" max="4" step="0.1" value="0" aria-label="基础费用"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="数量与价格的预测线和实际数据"></canvas><p>绿色点是实际价格；金色线是模型的预测。</p></div>`;
  const slider=root.querySelector('input'),baseSlider=root.querySelector('.base'),canvas=root.querySelector('canvas');
  root.querySelector('.base-control').hidden=!withBase;
  function draw(){
    const price=+slider.value, base=withBase?+baseSlider.value:0, data=withBase?[[1,4],[2,6],[3,8]]:[[1,2],[2,4],[3,6]], loss=data.reduce((sum,[x,y])=>sum+(price*x+base-y)**2,0)/data.length;
    root.querySelector('.readout').textContent=`预测价格 = 数量 × ${price.toFixed(1)} + ${base.toFixed(1)}　｜　平均平方误差 ${loss.toFixed(2)}`;
    const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);
    const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,unit=size/12,X=x=>left+x*unit,Y=y=>bottom-y*unit;
    c.strokeStyle='#718577';c.lineWidth=1;c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.font='11px sans-serif';c.fillStyle='#b8caba';c.textAlign='center';
    for(let v=0;v<=12;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}
    c.textAlign='left';c.fillText('价格（元）',left+4,bottom-size+12);c.textAlign='right';c.fillText('数量',left+size,h-3);
    c.strokeStyle='#f1bc68';c.lineWidth=2;c.beginPath();c.moveTo(X(0),Y(base));const endX=price>0?Math.min(3,(12-base)/price):3;c.lineTo(X(endX),Y(endX*price+base));c.stroke();
    for(const [x,y] of data){c.strokeStyle='#ef9981';c.setLineDash([3,3]);c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(x),Y(price*x+base));c.stroke();c.setLineDash([]);c.fillStyle='#a4d8a4';c.beginPath();c.arc(X(x),Y(y),6,0,Math.PI*2);c.fill();}
  }
  slider.addEventListener('input',draw);baseSlider.addEventListener('input',draw);draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function twoParameterTraining(root) {
  root.innerHTML=`<div class="callout"><b>任务：连续点击，观察预测线靠近数据点</b><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="两个参数训练时预测线和数据点"></canvas><p class="hint"></p><button class="btn btn-primary step">训练一步</button> <button class="btn btn-ghost reset">重新开始</button></div>`;
  const canvas=root.querySelector('canvas'), data=[[1,4],[2,6],[3,8]];let weight=1, bias=0, rounds=0, previous=null;
  function draw(){
    const loss=data.reduce((sum,[x,y])=>sum+(weight*x+bias-y)**2,0)/data.length;
    root.querySelector('.readout').textContent=`第 ${rounds} 步　单价 ${weight.toFixed(2)}　基础费用 ${bias.toFixed(2)}　损失 ${loss.toFixed(2)}`;
    root.querySelector('.hint').textContent=rounds?'灰线是更新前，金线是更新后。每次根据所有数据计算两个参数的调整方向。':'金线是当前预测，绿色点是实际数据。点击训练一步。';
    const w=canvas.clientWidth||260,h=300,dpr=devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);
    const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,unit=size/12,X=x=>left+x*unit,Y=y=>bottom-y*unit;
    c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.font='11px sans-serif';c.fillStyle='#b8caba';c.textAlign='center';for(let v=0;v<=12;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('价格（元）',left+4,bottom-size+12);c.textAlign='right';c.fillText('数量',left+size,h-3);
    function line(a,b,color){c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(X(0),Y(b));c.lineTo(X(3),Y(3*a+b));c.stroke();}
    if(previous)line(previous[0],previous[1],'#77877b');line(weight,bias,'#f1bc68');
    for(const [x,y] of data){c.strokeStyle='#ef9981';c.setLineDash([3,3]);c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(x),Y(weight*x+bias));c.stroke();c.setLineDash([]);c.fillStyle='#a4d8a4';c.beginPath();c.arc(X(x),Y(y),6,0,Math.PI*2);c.fill();}
  }
  root.querySelector('.step').addEventListener('click',()=>{const dw=2*data.reduce((sum,[x,y])=>sum+(weight*x+bias-y)*x,0)/data.length, db=2*data.reduce((sum,[x,y])=>sum+weight*x+bias-y,0)/data.length;previous=[weight,bias];weight-=0.08*dw;bias-=0.08*db;rounds++;draw();});
  root.querySelector('.reset').addEventListener('click',()=>{weight=1;bias=0;rounds=0;previous=null;draw();});draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function generalizationExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：先调节曲线贴近绿色点，再显示新数据</b><p><label>弯曲程度 <input type="range" min="0" max="1" step="0.05" value="0" aria-label="弯曲程度"></label> <button class="btn btn-ghost reveal">显示新数据</button></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="训练点、新数据和预测曲线"></canvas><p class="hint"></p></div>`;
  const slider=root.querySelector('input'),canvas=root.querySelector('canvas'),button=root.querySelector('.reveal');let reveal=false;
  const training=[[1,2],[2,5],[3,5]], test=[[1.5,3],[2.5,5]], base=x=>2*x, flexible=x=>-1.5*x*x+7.5*x-4, predict=(x,a)=>base(x)*(1-a)+flexible(x)*a;
  function draw(){const a=+slider.value, mse=points=>points.reduce((sum,[x,y])=>sum+(predict(x,a)-y)**2,0)/points.length;root.querySelector('.readout').textContent=`训练数据误差 ${mse(training).toFixed(2)}${reveal?`　｜　新数据误差 ${mse(test).toFixed(2)}`:''}`;root.querySelector('.hint').textContent=reveal?'蓝点是没有用来调整曲线的新数据。比较两组误差。':'绿色点是已知数据。先尝试让曲线贴近它们。';button.textContent=reveal?'隐藏新数据':'显示新数据';
    const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,unit=size/10,X=x=>left+x*unit,Y=y=>bottom-y*unit;
    c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.font='11px sans-serif';c.fillStyle='#b8caba';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('输出',left+4,bottom-size+12);c.textAlign='right';c.fillText('输入',left+size,h-3);
    c.strokeStyle='#f1bc68';c.lineWidth=2;c.beginPath();for(let i=0;i<=100;i++){const x=1+2*i/100;i?c.lineTo(X(x),Y(predict(x,a))):c.moveTo(X(x),Y(predict(x,a)));}c.stroke();
    for(const [points,color] of [[training,'#a4d8a4'],...(reveal?[[test,'#86bced']]:[])])for(const [x,y] of points){c.fillStyle=color;c.beginPath();c.arc(X(x),Y(y),6,0,Math.PI*2);c.fill();}
  }
  slider.addEventListener('input',draw);button.addEventListener('click',()=>{reveal=!reveal;draw();});draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function fitComparison(root) {
  root.innerHTML=`<div class="callout"><b>任务：切换模型，比较两组数据</b><p><button class="btn btn-ghost" data-model="0">简单</button> <button class="btn btn-ghost" data-model="1">适中</button> <button class="btn btn-ghost" data-model="2">复杂</button></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="不同复杂度的预测曲线和数据点"></canvas><p class="hint"></p></div>`;
  const canvas=root.querySelector('canvas'), training=[[1,2],[2,5],[3,5]], test=[[1.5,3],[2.5,5]];let model=0;
  const functions=[x=>4,x=>2*x,x=>-1.5*x*x+7.5*x-4], labels=['简单：预测始终相同','适中：直线跟随整体趋势','复杂：曲线穿过所有训练点'];
  function draw(){const f=functions[model], mse=points=>points.reduce((sum,[x,y])=>sum+(f(x)-y)**2,0)/points.length;root.querySelector('.readout').textContent=`训练误差 ${mse(training).toFixed(2)}　｜　新数据误差 ${mse(test).toFixed(2)}`;root.querySelector('.hint').textContent=labels[model]+'。绿色是训练数据，蓝色是新数据；数值是平均平方误差。';root.querySelectorAll('[data-model]').forEach(b=>{b.classList.toggle('btn-primary',+b.dataset.model===model);b.setAttribute('aria-pressed',String(+b.dataset.model===model));});
    const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,unit=size/10,X=x=>left+x*unit,Y=y=>bottom-y*unit;
    c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.font='11px sans-serif';c.fillStyle='#b8caba';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('输出',left+4,bottom-size+12);c.textAlign='right';c.fillText('输入',left+size,h-3);
    c.strokeStyle='#f1bc68';c.lineWidth=2;c.beginPath();for(let i=0;i<=100;i++){const x=1+2*i/100;i?c.lineTo(X(x),Y(f(x))):c.moveTo(X(x),Y(f(x)));}c.stroke();for(const [points,color] of [[training,'#a4d8a4'],[test,'#86bced']])for(const [x,y] of points){c.fillStyle=color;c.beginPath();c.arc(X(x),Y(y),6,0,Math.PI*2);c.fill();}
  }
  root.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>{model=+b.dataset.model;draw();}));draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function dataSplitExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：依次点击，观察每组数据的用途</b><div class="split-buttons"><button class="btn btn-ghost" data-stage="0">① 训练</button> <button class="btn btn-ghost" data-stage="1">② 验证</button> <button class="btn btn-ghost" data-stage="2">③ 测试</button></div><canvas style="width:100%;height:240px" aria-label="数据划分与各阶段用途"></canvas><div class="formula readout" aria-live="polite"></div><p class="hint"></p></div>`;
  const canvas=root.querySelector('canvas');let stage=0;
  function draw(){const names=['训练集','验证集','测试集'],descriptions=['用训练集调整模型参数。','用验证集比较候选模型，选择方案。','确定方案后，用未参与选择的测试集做最终评估。'];root.querySelector('.readout').textContent=names[stage]+' → '+['调整参数','选择模型','最终评估'][stage];root.querySelector('.hint').textContent=descriptions[stage];root.querySelectorAll('[data-stage]').forEach(b=>{b.classList.toggle('btn-primary',+b.dataset.stage===stage);b.setAttribute('aria-pressed',String(+b.dataset.stage===stage));});
    const w=canvas.clientWidth||260,h=240,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const colors=['#a4d8a4','#86bced','#f1bc68'], counts=[6,2,2], gap=8, cell=Math.min(34,(w-60-9*gap)/10), start=(w-(10*cell+9*gap))/2;let k=0;
    c.font='13px sans-serif';c.textAlign='center';for(let group=0;group<3;group++){const first=k;for(let i=0;i<counts[group];i++,k++){const x=start+k*(cell+gap);c.globalAlpha=group===stage?1:0.3;c.fillStyle=colors[group];c.fillRect(x,70,cell,cell);c.fillStyle='#172019';c.fillText(String(k+1),x+cell/2,70+cell/2+5);}c.globalAlpha=1;const mid=start+(first+(counts[group]-1)/2)*(cell+gap)+cell/2;c.fillStyle=colors[group];c.fillText(names[group],mid,70+cell+25);if(group===stage){c.fillText('↑ 当前使用',mid,70+cell+48);}}
    c.fillStyle='#cbd8ce';c.fillText('10 个样本 → 分成互不重叠的三组',w/2,35);
  }
  root.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>{stage=+b.dataset.stage;draw();}));draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function leakageExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：切换两种做法，对比测试结果</b><p><button class="btn btn-ghost clean">保留测试题</button> <button class="btn btn-ghost leak">提前看到测试答案</button></p><canvas style="width:100%;height:250px" aria-label="训练数据与测试数据是否重叠的示意图"></canvas><div class="formula readout" aria-live="polite"></div><p class="hint"></p></div>`;
  const canvas=root.querySelector('canvas');let leaked=false;
  function draw(){const clean=root.querySelector('.clean'),leak=root.querySelector('.leak');clean.classList.toggle('btn-primary',!leaked);leak.classList.toggle('btn-primary',leaked);clean.setAttribute('aria-pressed',String(!leaked));leak.setAttribute('aria-pressed',String(leaked));root.querySelector('.readout').textContent=leaked?'测试题答案已被提前看到':'测试题没有参与训练';root.querySelector('.hint').textContent=leaked?'示意结果：这道题答对了，但无法判断模型面对新题的能力。':'示意结果：独立测试才能检查模型对新题的表现。';
    const w=canvas.clientWidth||260,h=250,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const gap=20, box=Math.min(180,(w-60-gap)/2), left=(w-box*2-gap)/2, y=55;c.font='14px sans-serif';c.textAlign='center';
    c.fillStyle='#263a2c';c.fillRect(left,y,box,110);c.fillStyle='#23344a';c.fillRect(left+box+gap,y,box,110);c.fillStyle='#a4d8a4';c.fillText('训练',left+box/2,y+25);c.fillStyle='#86bced';c.fillText('测试',left+box+gap+box/2,y+25);c.font='24px sans-serif';c.fillStyle='#dce8dc';c.fillText(leaked?'① ② ③ ★':'① ② ③',left+box/2,y+70);c.fillText('★',left+box+gap+box/2,y+70);
    if(leaked){c.strokeStyle='#f1bc68';c.lineWidth=3;c.beginPath();c.moveTo(left+box+gap,y+85);c.lineTo(left+box,y+85);c.stroke();c.fillStyle='#f1bc68';c.font='12px sans-serif';c.fillText('答案泄漏',w/2,y+140);}else{c.fillStyle='#cbd8ce';c.font='12px sans-serif';c.fillText('保持分开',w/2,y+140);}
  }
  root.querySelector('.clean').addEventListener('click',()=>{leaked=false;draw();});root.querySelector('.leak').addEventListener('click',()=>{leaked=true;draw();});draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function classificationExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：拖动分界线，尽量把两类样本分开</b><p><label>分界位置 <input type="range" min="0" max="10" step="0.1" value="4" aria-label="分类分界位置"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:220px" aria-label="样本与分类分界线"></canvas><p>绿色圆点是 A 类，蓝色方块是 B 类。分界线左边预测为 A，右边预测为 B。</p></div>`;
  const slider=root.querySelector('input'),canvas=root.querySelector('canvas'),samples=[[1,'A'],[2.5,'A'],[4,'A'],[6,'B'],[7.5,'B'],[9,'B']];
  function draw(){const boundary=+slider.value,correct=samples.filter(([x,label])=>(x<boundary?'A':'B')===label).length;root.querySelector('.readout').textContent=`分界位置 ${boundary.toFixed(1)}　｜　分类正确 ${correct} / ${samples.length}`;
    const w=canvas.clientWidth||260,h=220,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const left=30,right=w-30,X=x=>left+x*(right-left)/10;
    c.fillStyle='#1d3023';c.fillRect(left,45,X(boundary)-left,125);c.fillStyle='#1b2e40';c.fillRect(X(boundary),45,right-X(boundary),125);c.strokeStyle='#718577';c.beginPath();c.moveTo(left,170);c.lineTo(right,170);c.stroke();c.font='12px sans-serif';c.textAlign='center';c.fillStyle='#cbd8ce';for(let v=0;v<=10;v+=2)c.fillText(String(v),X(v),190);c.fillText('左边预测 A',left+(X(boundary)-left)/2,65);c.fillText('右边预测 B',X(boundary)+(right-X(boundary))/2,65);
    c.strokeStyle='#f1bc68';c.lineWidth=3;c.beginPath();c.moveTo(X(boundary),45);c.lineTo(X(boundary),170);c.stroke();
    samples.forEach(([x,label],i)=>{const y=95+(i%2)*35,ok=(x<boundary?'A':'B')===label;c.fillStyle=label==='A'?'#a4d8a4':'#86bced';if(label==='A'){c.beginPath();c.arc(X(x),y,8,0,Math.PI*2);c.fill();}else c.fillRect(X(x)-8,y-8,16,16);if(!ok){c.fillStyle='#f19d8a';c.fillText('×',X(x),y-12);}});
  }
  slider.addEventListener('input',draw);draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function accuracyExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：切换两个模型，比较正确率和每一类的结果</b><p><button class="btn btn-ghost" data-choice="0">模型 A</button> <button class="btn btn-ghost" data-choice="1">模型 B</button></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:240px" aria-label="两类样本的分类结果"></canvas><p class="hint"></p></div>`;
  const canvas=root.querySelector('canvas');let choice=0;
  // 8 个 A、2 个 B；模型 A 全部预测为 A，模型 B 各错一个。
  const labels=['A','A','A','A','A','A','A','A','B','B'], predictions=[['A','A','A','A','A','A','A','A','A','A'],['A','A','A','A','A','A','A','B','A','B']];
  function draw(){const pred=predictions[choice], correct=pred.filter((v,i)=>v===labels[i]).length, bCorrect=pred.filter((v,i)=>labels[i]==='B'&&v==='B').length;root.querySelector('.readout').textContent=`正确率 ${correct} ÷ 10 = ${correct*10}%　｜　B 类识别正确 ${bCorrect} / 2`;root.querySelector('.hint').textContent=choice===0?'模型 A 都猜 A：总正确率高，但两个 B 全部错过。':'模型 B 两类各分错一个：总正确率相同，但找到了一个 B。';root.querySelectorAll('[data-choice]').forEach(b=>{b.classList.toggle('btn-primary',+b.dataset.choice===choice);b.setAttribute('aria-pressed',String(+b.dataset.choice===choice));});
    const w=canvas.clientWidth||260,h=240,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const cell=Math.min(46,(w-50)/5), left=(w-cell*5)/2;c.textAlign='center';c.font='12px sans-serif';
    labels.forEach((label,i)=>{const x=left+(i%5)*cell+cell/2,y=55+Math.floor(i/5)*80,ok=pred[i]===label;c.fillStyle=label==='A'?'#a4d8a4':'#86bced';if(label==='A'){c.beginPath();c.arc(x,y,13,0,Math.PI*2);c.fill();}else c.fillRect(x-13,y-13,26,26);c.fillStyle=ok?'#d9ead9':'#f19d8a';c.fillText(`猜 ${pred[i]} ${ok?'✓':'×'}`,x,y+34);});c.fillStyle='#cbd8ce';c.fillText('绿色圆点：实际 A　　蓝色方块：实际 B',w/2,220);
  }
  root.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{choice=+b.dataset.choice;draw();}));draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function classificationErrors(root) {
  root.innerHTML=`<div class="callout"><b>任务：点击每个样本，切换模型预测</b><p>蓝色方块是实际 B 类；绿色圆点是实际 A 类。目标是找出 B 类。</p><div class="error-samples" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center"></div><div class="formula readout" aria-live="polite"></div><p class="hint"></p><button class="btn btn-ghost reset">重新开始</button></div>`;
  const labels=['A','A','A','A','B','B'], initial=['A','B','A','A','A','B'];let predictions=[...initial];
  function draw(){const container=root.querySelector('.error-samples');container.innerHTML='';let missed=0,falseAlarm=0,found=0;
    labels.forEach((label,i)=>{const prediction=predictions[i];if(label==='B'&&prediction==='A')missed++;if(label==='A'&&prediction==='B')falseAlarm++;if(label==='B'&&prediction==='B')found++;const b=document.createElement('button');b.className='quiz-opt';b.style.cssText='min-width:85px;text-align:center;font-size:15px';b.innerHTML=`<span style="font-size:28px;color:${label==='A'?'#a4d8a4':'#86bced'}">${label==='A'?'●':'■'}</span><br>猜 ${prediction}`;b.setAttribute('aria-label',`样本 ${i+1}，实际 ${label}，预测 ${prediction}，点击切换预测`);b.addEventListener('click',()=>{predictions[i]=prediction==='A'?'B':'A';draw();});container.appendChild(b);});
    root.querySelector('.readout').textContent=`找对 B：${found}　｜　漏掉 B：${missed}　｜　误报 B：${falseAlarm}`;root.querySelector('.hint').textContent='漏掉：实际是 B 却猜 A。误报：实际是 A 却猜 B。点击样本，看看计数怎样变化。';
  }
  root.querySelector('.reset').addEventListener('click',()=>{predictions=[...initial];draw();});draw();
}
function precisionRecallExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：点击样本，改变模型是否把它报为 B</b><p>蓝色方块是实际 B；绿色圆点是实际 A。金色边框表示模型报为 B。</p><div class="samples" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center"></div><div class="formula readout" aria-live="polite"></div><p class="hint"></p><button class="btn btn-ghost reset">重新开始</button></div>`;
  const labels=['A','A','A','A','B','B'], initial=[false,true,false,false,false,true];let selected=[...initial];
  function draw(){let found=0, reported=0;const box=root.querySelector('.samples');box.innerHTML='';labels.forEach((label,i)=>{if(selected[i])reported++;if(selected[i]&&label==='B')found++;const b=document.createElement('button');b.className='quiz-opt';b.style.cssText=`min-width:85px;text-align:center;border:2px solid ${selected[i]?'#f1bc68':'#526154'}`;b.innerHTML=`<span style="font-size:28px;color:${label==='A'?'#a4d8a4':'#86bced'}">${label==='A'?'●':'■'}</span><br>${selected[i]?'报 B':'未报 B'}`;b.setAttribute('aria-label',`样本 ${i+1}，实际 ${label}，${selected[i]?'报为 B':'未报为 B'}`);b.setAttribute('aria-pressed',String(selected[i]));b.onclick=()=>{selected[i]=!selected[i];draw();};box.appendChild(b);});
    root.querySelector('.readout').textContent=`找对 ${found} 个 B　｜　共报 ${reported} 个 B　｜　实际共 2 个 B`;
    root.querySelector('.hint').textContent=`精确率：报出的 ${reported} 个中有 ${found} 个正确 = ${reported?(100*found/reported).toFixed(0)+'%':'未定义（没有报出 B）'}。召回率：实际 2 个 B 中找对 ${found} 个 = ${(50*found).toFixed(0)}%。`;
  }
  root.querySelector('.reset').onclick=()=>{selected=[...initial];draw();};draw();
}
function thresholdExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：拖动门槛，观察哪些样本被报为 B</b><p><label>门槛 <input type="range" min="0" max="1" step="0.05" value="0.5" aria-label="分类门槛"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:250px" aria-label="分类分数和门槛"></canvas><p class="hint"></p></div>`;
  const canvas=root.querySelector('canvas'),slider=root.querySelector('input'),samples=[[.12,'A'],[.3,'A'],[.48,'B'],[.55,'A'],[.72,'B'],[.88,'B']];
  function draw(){const threshold=+slider.value,found=samples.filter(([score,label])=>score>=threshold&&label==='B').length,reported=samples.filter(([score])=>score>=threshold).length,missed=3-found,wrong=reported-found;
    root.querySelector('.readout').textContent=`门槛 ${threshold.toFixed(2)}　｜　找到 ${found}　漏掉 ${missed}　误报 ${wrong}`;root.querySelector('.hint').textContent=`精确率 ${reported?(100*found/reported).toFixed(0)+'%':'未定义'}　｜　召回率 ${(100*found/3).toFixed(0)}%。分数达到门槛就报 B。`;
    const w=canvas.clientWidth||260,h=250,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const left=30,right=w-30,X=x=>left+x*(right-left);c.fillStyle='#263a2c';c.fillRect(left,50,X(threshold)-left,130);c.fillStyle='#283c50';c.fillRect(X(threshold),50,right-X(threshold),130);c.strokeStyle='#f1bc68';c.lineWidth=3;c.beginPath();c.moveTo(X(threshold),40);c.lineTo(X(threshold),185);c.stroke();c.fillStyle='#cbd8ce';c.font='12px sans-serif';c.textAlign='center';for(let i=0;i<=4;i++)c.fillText((i/4).toFixed(2),X(i/4),205);c.fillText('分数 →',w/2,230);
    samples.forEach(([score,label],i)=>{const x=X(score),y=80+(i%2)*55;c.fillStyle=label==='A'?'#a4d8a4':'#86bced';if(label==='A'){c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();}else c.fillRect(x-8,y-8,16,16);c.fillStyle='#dce8dc';c.fillText(score>=threshold?'报 B':'未报',x,y+25);});
  }
  slider.addEventListener('input',draw);draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function twoFeaturesExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：拖动分界位置，观察两个特征如何一起决定类别</b><p><label>分界位置 <input type="range" min="2" max="14" step="0.5" value="8" aria-label="分界位置"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="两个特征的分类图"></canvas><p>绿色圆点是实际 A，蓝色方块是实际 B；红色圈表示分错。</p></div>`;
  const canvas=root.querySelector('canvas'),slider=root.querySelector('input'),samples=[[1,2,'A'],[2,4,'A'],[4,2,'A'],[4,5,'B'],[6,4,'B'],[7,7,'B']];
  function draw(){const boundary=+slider.value,correct=samples.filter(([x,y,label])=>(x+y<boundary?'A':'B')===label).length;root.querySelector('.readout').textContent=`特征 1 + 特征 2 ≥ ${boundary.toFixed(1)} → 预测 B　｜　正确 ${correct} / ${samples.length}`;
    const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,unit=size/10,X=x=>left+x*unit,Y=y=>bottom-y*unit;
    c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#b8caba';c.font='11px sans-serif';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('特征 2',left+4,bottom-size+12);c.textAlign='right';c.fillText('特征 1',left+size,h-3);
    const start=Math.max(0,boundary-10),end=Math.min(10,boundary);c.strokeStyle='#f1bc68';c.lineWidth=2;c.beginPath();c.moveTo(X(start),Y(boundary-start));c.lineTo(X(end),Y(boundary-end));c.stroke();
    for(const [x,y,label] of samples){const wrong=(x+y<boundary?'A':'B')!==label;c.fillStyle=label==='A'?'#a4d8a4':'#86bced';if(label==='A'){c.beginPath();c.arc(X(x),Y(y),6,0,Math.PI*2);c.fill();}else c.fillRect(X(x)-6,Y(y)-6,12,12);if(wrong){c.strokeStyle='#ef9981';c.lineWidth=2;c.beginPath();c.arc(X(x),Y(y),11,0,Math.PI*2);c.stroke();}}
  }
  slider.addEventListener('input',draw);draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function nonlinearExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：先移动直线，再切换到圆形边界</b><p><button class="btn btn-ghost" data-mode="line">直线</button> <button class="btn btn-ghost" data-mode="circle">圆形</button></p><p><label class="label">分界位置 <input type="range" min="0" max="10" step="0.5" value="5" aria-label="分界参数"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="直线与圆形分类边界"></canvas><p>绿色圆点是 A，蓝色方块是 B，红圈表示分错。</p></div>`;
  const canvas=root.querySelector('canvas'),slider=root.querySelector('input'),samples=[[5,5,'A'],[4,5,'A'],[6,5,'A'],[5,4,'A'],[5,6,'A'],[2,2,'B'],[5,1,'B'],[8,2,'B'],[9,5,'B'],[8,8,'B'],[5,9,'B'],[2,8,'B'],[1,5,'B']];let mode='line';
  function draw(){const value=+slider.value,radius=value/2, classify=(x,y)=>mode==='line'?(x<value?'A':'B'):(Math.hypot(x-5,y-5)<radius?'A':'B'),correct=samples.filter(([x,y,label])=>classify(x,y)===label).length;root.querySelector('.readout').textContent=`${mode==='line'?'直线位置 '+value.toFixed(1):'圆的半径 '+radius.toFixed(1)}　｜　正确 ${correct} / ${samples.length}`;root.querySelector('.label').firstChild.textContent=mode==='line'?'分界位置 ':'圆的大小 ';root.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('btn-primary',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});
    const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,u=size/10,X=x=>left+x*u,Y=y=>bottom-y*u;
    c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#b8caba';c.font='11px sans-serif';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('特征 2',left+4,bottom-size+12);c.textAlign='right';c.fillText('特征 1',left+size,h-3);
    c.strokeStyle='#f1bc68';c.lineWidth=2;c.beginPath();if(mode==='line'){c.moveTo(X(value),Y(0));c.lineTo(X(value),Y(10));}else c.arc(X(5),Y(5),radius*u,0,2*Math.PI);c.stroke();
    for(const [x,y,label] of samples){c.fillStyle=label==='A'?'#a4d8a4':'#86bced';if(label==='A'){c.beginPath();c.arc(X(x),Y(y),6,0,2*Math.PI);c.fill();}else c.fillRect(X(x)-6,Y(y)-6,12,12);if(classify(x,y)!==label){c.strokeStyle='#ef9981';c.lineWidth=2;c.beginPath();c.arc(X(x),Y(y),11,0,2*Math.PI);c.stroke();}}
  }
  root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;slider.value=mode==='line'?'5':'6';draw();});slider.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function distanceExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：拖动两个坐标，观察点离中心有多远</b><p><label>横向位置 <input class="x" type="range" min="0" max="10" step="0.5" value="8"></label> <label>纵向位置 <input class="y" type="range" min="0" max="10" step="0.5" value="5"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="点到中心的距离"></canvas><p>金色点可移动，绿色点是中心；虚线连起两个点。</p></div>`;
  const canvas=root.querySelector('canvas'),sx=root.querySelector('.x'),sy=root.querySelector('.y');
  function draw(){const x=+sx.value,y=+sy.value,d=Math.hypot(x-5,y-5);root.querySelector('.readout').textContent=`到中心的距离 ${d.toFixed(2)}　｜　${d<3?'圆内 → 预测 A':'圆外或边界 → 预测 B'}`;
    const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,u=size/10,X=v=>left+v*u,Y=v=>bottom-v*u;
    c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#b8caba';c.font='11px sans-serif';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('特征 2',left+4,bottom-size+12);c.textAlign='right';c.fillText('特征 1',left+size,h-3);
    c.strokeStyle='#86bced';c.lineWidth=2;c.beginPath();c.arc(X(5),Y(5),3*u,0,2*Math.PI);c.stroke();c.setLineDash([4,4]);c.strokeStyle='#f1bc68';c.beginPath();c.moveTo(X(5),Y(5));c.lineTo(X(x),Y(y));c.stroke();c.setLineDash([]);c.fillStyle='#a4d8a4';c.beginPath();c.arc(X(5),Y(5),6,0,2*Math.PI);c.fill();c.fillStyle='#f1bc68';c.beginPath();c.arc(X(x),Y(y),7,0,2*Math.PI);c.fill();
  }
  sx.oninput=draw;sy.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function pythagorasExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：拖动两条直角边，观察斜边和两个正方形</b><p><label>横向长度 <input class="a" type="range" min="1" max="4" step="1" value="3"></label> <label>纵向长度 <input class="b" type="range" min="1" max="4" step="1" value="4"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="直角三角形及边长对应的正方形面积"></canvas><p>每个小格代表 1 个面积单位；斜边长度乘自己，等于两个正方形面积之和。</p></div>`;
  const canvas=root.querySelector('canvas'),aInput=root.querySelector('.a'),bInput=root.querySelector('.b');
  function draw(){const a=+aInput.value,b=+bInput.value,hyp=Math.hypot(a,b),area=a*a+b*b;root.querySelector('.readout').textContent=`${a}² + ${b}² = ${area}　｜　斜边长度 = √${area} ≈ ${hyp.toFixed(2)}`;
    const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const u=Math.min((w-50)/13,18), x=(w-13*u)/2+u,y=180;
    c.strokeStyle='#a4d8a4';c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x+a*u,y);c.lineTo(x+a*u,y-b*u);c.closePath();c.stroke();c.fillStyle='#dce8dc';c.font='12px sans-serif';c.textAlign='center';c.fillText(String(a),x+a*u/2,y+16);c.fillText(String(b),x+a*u+12,y-b*u/2);c.fillText(hyp.toFixed(2),x+a*u/2-12,y-b*u/2-7);
    const squares=[[a,0,'#a4d8a4'],[b,5,'#86bced']];for(const [side,offset,color] of squares){for(let row=0;row<side;row++)for(let col=0;col<side;col++){c.fillStyle=color;c.fillRect(x+offset*u+col*u,y+35+row*u,u-2,u-2);}}c.fillStyle='#cbd8ce';c.textAlign='left';c.fillText(`${a} × ${a} = ${a*a}`,x,y+28);c.fillText(`${b} × ${b} = ${b*b}`,x+5*u,y+28);
  }
  aInput.oninput=draw;bInput.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function squareRootExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：拖动边长，观察正方形里的格子</b><p><label>边长 <input type="range" min="1" max="8" step="1" value="3" aria-label="正方形边长"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:270px" aria-label="边长与面积的关系"></canvas><p>面积是格子总数；平方根是从面积反过来找正方形的边长。</p></div>`;
  const canvas=root.querySelector('canvas'),slider=root.querySelector('input');function draw(){const n=+slider.value;root.querySelector('.readout').textContent=`边长 ${n} × ${n} = 面积 ${n*n}　｜　√${n*n} = ${n}`;const w=canvas.clientWidth||260,h=270,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const unit=Math.min(25,(w-60)/8,(h-50)/8),left=(w-n*unit)/2,top=(h-n*unit)/2;c.fillStyle='#a4d8a4';for(let y=0;y<n;y++)for(let x=0;x<n;x++)c.fillRect(left+x*unit,top+y*unit,unit-2,unit-2);c.fillStyle='#dce8dc';c.font='14px sans-serif';c.textAlign='center';c.fillText(`边长 ${n}`,w/2,top-10);c.save();c.translate(left-10,top+n*unit/2);c.rotate(-Math.PI/2);c.fillText(`边长 ${n}`,0,0);c.restore();}
  slider.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function nearestNeighborExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：移动金色点，观察最近的已知样本</b><p><label>横向位置 <input class="x" type="range" min="0" max="10" step="0.5" value="5"></label> <label>纵向位置 <input class="y" type="range" min="0" max="10" step="0.5" value="5"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="新样本和最近已知样本"></canvas><p>绿色圆点是已知 A，蓝色方块是已知 B；金色点是待分类样本。</p></div>`;
  const canvas=root.querySelector('canvas'),sx=root.querySelector('.x'),sy=root.querySelector('.y'),samples=[[2,3,'A'],[3,7,'A'],[7,3,'B'],[8,7,'B']];
  function draw(){const x=+sx.value,y=+sy.value,distances=samples.map(([a,b])=>Math.hypot(x-a,y-b)),min=Math.min(...distances),nearest=samples.filter((_,i)=>Math.abs(distances[i]-min)<1e-9),labels=[...new Set(nearest.map(p=>p[2]))];root.querySelector('.readout').textContent=labels.length>1?`最近距离 ${min.toFixed(2)}　｜　A 与 B 同样近，暂不判定`:`最近距离 ${min.toFixed(2)}　｜　预测 ${labels[0]} 类`;
    const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,u=size/10,X=v=>left+v*u,Y=v=>bottom-v*u;
    c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#b8caba';c.font='11px sans-serif';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('特征 2',left+4,bottom-size+12);c.textAlign='right';c.fillText('特征 1',left+size,h-3);
    c.strokeStyle='#f1bc68';c.setLineDash([4,4]);for(const [a,b] of nearest){c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(a),Y(b));c.stroke();}c.setLineDash([]);for(const [a,b,label] of samples){c.fillStyle=label==='A'?'#a4d8a4':'#86bced';if(label==='A'){c.beginPath();c.arc(X(a),Y(b),6,0,2*Math.PI);c.fill();}else c.fillRect(X(a)-6,Y(b)-6,12,12);}c.fillStyle='#f1bc68';c.beginPath();c.arc(X(x),Y(y),7,0,2*Math.PI);c.fill();
  }
  sx.oninput=draw;sy.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function neighborVoteExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：移动新样本，切换参考的邻居数量</b><p><label>横向 <input class="x" type="range" min="0" max="10" step="0.5" value="5"></label> <label>纵向 <input class="y" type="range" min="0" max="10" step="0.5" value="5"></label></p><p><label>邻居数量 <select class="k"><option value="1">1 个</option><option value="3" selected>3 个</option><option value="5">5 个</option></select></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="最近邻居投票"></canvas><p>金色虚线连接参与投票的邻居；绿色是 A，蓝色是 B。</p></div>`;
  const canvas=root.querySelector('canvas'),sx=root.querySelector('.x'),sy=root.querySelector('.y'),sk=root.querySelector('.k'),samples=[[2,3,'A'],[3,7,'A'],[4,4,'A'],[6,4,'B'],[7,3,'B'],[8,7,'B'],[7,8,'B']];
  function draw(){const x=+sx.value,y=+sy.value,k=+sk.value,ordered=samples.map((p,i)=>({p,i,d:Math.hypot(x-p[0],y-p[1])})).sort((a,b)=>a.d-b.d||a.i-b.i), cutoff=ordered[k-1].d,tie=k<ordered.length&&Math.abs(ordered[k].d-cutoff)<1e-9,nearest=ordered.slice(0,k),a=nearest.filter(v=>v.p[2]==='A').length,b=k-a;
    root.querySelector('.readout').textContent=tie?'第 K 位距离出现并列，暂不判定':`A 得 ${a} 票　｜　B 得 ${b} 票　→　预测 ${a>b?'A':'B'}`;
    const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,u=size/10,X=v=>left+v*u,Y=v=>bottom-v*u;
    c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#b8caba';c.font='11px sans-serif';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('特征 2',left+4,bottom-size+12);c.textAlign='right';c.fillText('特征 1',left+size,h-3);
    c.strokeStyle='#f1bc68';c.setLineDash([4,4]);if(!tie)for(const {p:[a,b]} of nearest){c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(a),Y(b));c.stroke();}c.setLineDash([]);for(const [a,b,label] of samples){c.fillStyle=label==='A'?'#a4d8a4':'#86bced';if(label==='A'){c.beginPath();c.arc(X(a),Y(b),6,0,2*Math.PI);c.fill();}else c.fillRect(X(a)-6,Y(b)-6,12,12);}c.fillStyle='#f1bc68';c.beginPath();c.arc(X(x),Y(y),7,0,2*Math.PI);c.fill();
  }
  sx.oninput=draw;sy.oninput=draw;sk.onchange=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function neighborRegions(root) {
  root.innerHTML=`<div class="callout"><b>任务：切换邻居数量，观察背景区域变化</b><p><label>邻居数量 <select><option value="1">1 个</option><option value="3">3 个</option><option value="5">5 个</option></select></label></p><canvas style="width:100%;height:300px" aria-label="最近邻分类区域，点击格子查看详情"></canvas><div class="formula detail" aria-live="polite">点击图中的任意小格，查看这个位置的判断过程。</div><p>灰色：第 K 个名额有距离相同的邻居，暂不判定。背景是采样得到的小格示意。</p></div>`;
  const canvas=root.querySelector('canvas'),select=root.querySelector('select'),samples=[[2,3,'A'],[3,7,'A'],[4,4,'A'],[6,4,'B'],[7,3,'B'],[8,7,'B'],[7,8,'B']];let selected=null;
  function classify(x,y,k){const ordered=samples.map((p,i)=>({p,i,d:Math.hypot(x-p[0],y-p[1])})).sort((a,b)=>a.d-b.d||a.i-b.i);if(k<ordered.length&&Math.abs(ordered[k].d-ordered[k-1].d)<1e-9)return null;const a=ordered.slice(0,k).filter(v=>v.p[2]==='A').length;return a>k-a?'A':'B';}
  function draw(){const k=+select.value,w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,u=size/10,X=v=>left+v*u,Y=v=>bottom-v*u,grid=60;
    for(let i=0;i<grid;i++)for(let j=0;j<grid;j++){const label=classify((i+.5)*10/grid,(j+.5)*10/grid,k);c.fillStyle=label==='A'?'#263e2d':label==='B'?'#263b50':'#545454';c.fillRect(X(i*10/grid),Y((j+1)*10/grid),size/grid+0.5,size/grid+0.5);}
    c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#b8caba';c.font='11px sans-serif';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('特征 2',left+4,bottom-size+12);c.textAlign='right';c.fillText('特征 1',left+size,h-3);
    for(const [x,y,label] of samples){c.fillStyle=label==='A'?'#a4d8a4':'#86bced';if(label==='A'){c.beginPath();c.arc(X(x),Y(y),6,0,2*Math.PI);c.fill();}else c.fillRect(X(x)-6,Y(y)-6,12,12);}
    if(selected){const [x,y]=selected, ordered=samples.map(([a,b,label])=>({label,d:Math.hypot(x-a,y-b)})).sort((a,b)=>a.d-b.d), tied=k<ordered.length&&Math.abs(ordered[k].d-ordered[k-1].d)<1e-9, label=classify(x,y,k);c.fillStyle='#f1bc68';c.beginPath();c.arc(X(x),Y(y),5,0,2*Math.PI);c.fill();root.querySelector('.detail').textContent=`位置 (${x.toFixed(2)}, ${y.toFixed(2)})：${tied?`第 ${k} 和第 ${k+1} 个邻居都距 ${ordered[k-1].d.toFixed(2)}，无法唯一选出 ${k} 个，暂不判定。`:`最近 ${k} 个：${ordered.slice(0,k).map(v=>v.label+' 类 '+v.d.toFixed(2)).join('、')}；预测 ${label} 类。`}`;}
  }
  canvas.addEventListener('click',event=>{const rect=canvas.getBoundingClientRect(),w=canvas.clientWidth,h=300,size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,x=(event.clientX-rect.left-left)/size*10,y=(bottom-(event.clientY-rect.top))/size*10;if(x<0||x>=10||y<0||y>=10)return;selected=[(Math.floor(x*6)+.5)/6,(Math.floor(y*6)+.5)/6];draw();});
  select.onchange=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function tieExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：移动金色点到中间，再切换并列处理规则</b><p><label>新样本位置 <input type="range" min="0" max="10" step="0.5" value="5"></label></p><p><button class="btn btn-ghost" data-rule="abstain">暂不判定</button> <button class="btn btn-ghost" data-rule="a">并列时选 A</button></p><div class="formula result" aria-live="polite"></div><canvas style="width:100%;height:200px" aria-label="距离并列时的分类"></canvas><p>这里展示的是人为选定的规则，并列时选 A 并不表示 A 更正确。</p></div>`;
  const slider=root.querySelector('input'),canvas=root.querySelector('canvas');let rule='abstain';function draw(){const x=+slider.value,da=Math.abs(x-2),db=Math.abs(x-8),tie=da===db,label=tie?(rule==='a'?'A':'暂不判定'):(da<db?'A':'B');root.querySelector('.result').textContent=`到 A 的距离 ${da.toFixed(1)}　｜　到 B 的距离 ${db.toFixed(1)}　→　${label}`;root.querySelectorAll('[data-rule]').forEach(b=>{b.classList.toggle('btn-primary',b.dataset.rule===rule);b.setAttribute('aria-pressed',String(b.dataset.rule===rule));});const w=canvas.clientWidth||260,h=200,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const left=35,right=w-35,X=v=>left+v*(right-left)/10;c.strokeStyle='#718577';c.beginPath();c.moveTo(left,115);c.lineTo(right,115);c.stroke();c.font='12px sans-serif';c.textAlign='center';c.fillStyle='#cbd8ce';for(let i=0;i<=10;i+=2)c.fillText(String(i),X(i),140);c.fillStyle='#a4d8a4';c.beginPath();c.arc(X(2),115,8,0,2*Math.PI);c.fill();c.fillText('A',X(2),95);c.fillStyle='#86bced';c.fillRect(X(8)-8,107,16,16);c.fillText('B',X(8),95);c.fillStyle='#f1bc68';c.beginPath();c.arc(X(x),60,7,0,2*Math.PI);c.fill();c.setLineDash([4,4]);c.strokeStyle='#f1bc68';c.beginPath();c.moveTo(X(x),60);c.lineTo(X(2),115);c.moveTo(X(x),60);c.lineTo(X(8),115);c.stroke();c.setLineDash([]);}
  slider.oninput=draw;root.querySelectorAll('[data-rule]').forEach(b=>b.onclick=()=>{rule=b.dataset.rule;draw();});draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function featureScaleExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：切换两种尺度，观察最近邻居是否改变</b><p><button class="btn btn-ghost" data-mode="raw">直接比较</button> <button class="btn btn-ghost" data-mode="scaled">按范围缩放</button></p><canvas style="width:100%;height:260px" aria-label="特征尺度对距离的影响"></canvas><div class="formula result" aria-live="polite"></div><p class="hint"></p></div>`;
  const canvas=root.querySelector('canvas');let mode='raw';const query=[170,5],a=[160,9],b=[200,5];function draw(){const scale=mode==='raw'?[1,1]:[100,10],d=p=>Math.hypot((p[0]-query[0])/scale[0],(p[1]-query[1])/scale[1]),da=d(a),db=d(b);root.querySelector('.result').textContent=`到 A 的距离 ${da.toFixed(2)}　｜　到 B 的距离 ${db.toFixed(2)}　→　最近 ${da<db?'A':'B'}`;root.querySelector('.hint').textContent=mode==='raw'?'特征 1 的差值数字更大，对距离影响更明显。':'特征 1 除以 100，特征 2 除以 10；两个维度的尺度改变了。';root.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('btn-primary',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});
    const w=canvas.clientWidth||260,h=260,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);c.font='13px sans-serif';c.textAlign='center';const positions=[w*.2,w*.5,w*.8],rows=[['A',a],['新样本',query],['B',b]];rows.forEach(([name,p],i)=>{const x=positions[i];c.fillStyle=i===1?'#f1bc68':i===0?'#a4d8a4':'#86bced';c.beginPath();c.arc(x,70,12,0,2*Math.PI);c.fill();c.fillText(name,x,45);c.fillStyle='#dce8dc';c.fillText(`特征 1：${p[0]}`,x,115);c.fillText(`特征 2：${p[1]}`,x,140);});c.strokeStyle='#718577';c.setLineDash([4,4]);c.beginPath();c.moveTo(positions[0],70);c.lineTo(positions[1],70);c.lineTo(positions[2],70);c.stroke();c.setLineDash([]);c.fillStyle='#cbd8ce';c.fillText('位置仅用于排列样本，距离以数值计算',w/2,210);
  }
  root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;draw();});draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function scalingExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：拖动数值，观察它在两条标尺上的位置</b><p><label>原始数值 <input type="range" min="100" max="200" step="1" value="150"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:220px" aria-label="原始数值和归一化数值的标尺"></canvas><p>把 100 映射到 0，把 200 映射到 1；中间的位置按比例转换。</p></div>`;
  const slider=root.querySelector('input'),canvas=root.querySelector('canvas');function draw(){const value=+slider.value,scaled=(value-100)/100;root.querySelector('.readout').textContent=`(${value} − 100) ÷ (200 − 100) = ${scaled.toFixed(2)}`;const w=canvas.clientWidth||260,h=220,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const left=45,right=w-45,X=t=>left+t*(right-left);c.font='13px sans-serif';c.textAlign='center';c.strokeStyle='#718577';c.lineWidth=2;for(const y of [65,155]){c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();}c.fillStyle='#cbd8ce';c.fillText('原始数值',w/2,28);c.fillText('缩放后',w/2,118);for(const [y,labels] of [[65,['100','150','200']],[155,['0','0.5','1']]])labels.forEach((label,i)=>{const x=X(i/2);c.fillText(label,x,y+24);c.beginPath();c.moveTo(x,y-4);c.lineTo(x,y+4);c.stroke();});c.fillStyle='#f1bc68';for(const y of [65,155]){c.beginPath();c.arc(X(scaled),y,7,0,2*Math.PI);c.fill();}c.strokeStyle='#f1bc68';c.setLineDash([4,4]);c.beginPath();c.moveTo(X(scaled),73);c.lineTo(X(scaled),147);c.stroke();c.setLineDash([]);}
  slider.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function scalingLeakExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：切换范围来源，观察同一训练样本的缩放结果</b><p><button class="btn btn-ghost" data-mode="train">只用训练集范围</button> <button class="btn btn-ghost" data-mode="all">包含测试集范围</button></p><canvas style="width:100%;height:230px" aria-label="训练与测试数据的缩放范围"></canvas><div class="formula readout" aria-live="polite"></div><p class="hint"></p></div>`;
  const canvas=root.querySelector('canvas');let mode='train';function draw(){const max=mode==='train'?200:300,value=150,scaled=(value-100)/(max-100),testScaled=(300-100)/(max-100);root.querySelector('.readout').textContent=`训练样本 150 → ${scaled.toFixed(2)}　｜　测试样本 300 → ${testScaled.toFixed(2)}`;root.querySelector('.hint').textContent=mode==='train'?'范围只由训练集的 100–200 确定。测试值超出训练范围，因此结果可以大于 1。':'范围包含了测试集的 300；训练样本的表示也被测试数据改变，发生数据泄漏。';root.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('btn-primary',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});
    const w=canvas.clientWidth||260,h=230,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const left=35,right=w-35,X=v=>left+(v-100)/200*(right-left);c.strokeStyle='#718577';c.lineWidth=2;c.beginPath();c.moveTo(left,110);c.lineTo(right,110);c.stroke();c.strokeStyle='#a4d8a4';c.lineWidth=7;c.beginPath();c.moveTo(X(100),110);c.lineTo(X(max),110);c.stroke();c.font='12px sans-serif';c.textAlign='center';for(const v of [100,150,200,300]){c.fillStyle=v===300?'#86bced':'#a4d8a4';c.beginPath();c.arc(X(v),110,6,0,2*Math.PI);c.fill();c.fillText(String(v),X(v),135);}c.fillStyle='#cbd8ce';c.fillText('绿色：训练样本　　蓝色：测试样本',w/2,45);c.fillText(mode==='train'?'绿色线：训练范围 100–200':'绿色线：包含测试值的范围 100–300',w/2,175);
  }
  root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;draw();});draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function weightedSumExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：拖动两个权重，观察输出的变化</b><p><label>第一个权重 <input class="w1" type="range" min="0" max="3" step="0.1" value="1"></label> <label>第二个权重 <input class="w2" type="range" min="0" max="3" step="0.1" value="1"></label></p><canvas style="width:100%;height:250px" aria-label="两个输入经过权重相加得到输出"></canvas><div class="formula readout" aria-live="polite"></div><p>线越粗，表示对应权重越大。输入固定为 2 和 3。</p></div>`;
  const canvas=root.querySelector('canvas'),w1=root.querySelector('.w1'),w2=root.querySelector('.w2');function draw(){const a=+w1.value,b=+w2.value,sum=2*a+3*b;root.querySelector('.readout').textContent=`2 × ${a.toFixed(1)} + 3 × ${b.toFixed(1)} = ${sum.toFixed(1)}`;const w=canvas.clientWidth||260,h=250,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const left=w*.2,right=w*.8,cy=125;c.strokeStyle='#a4d8a4';c.lineWidth=1+a*3;c.beginPath();c.moveTo(left,65);c.lineTo(right,cy);c.stroke();c.strokeStyle='#86bced';c.lineWidth=1+b*3;c.beginPath();c.moveTo(left,185);c.lineTo(right,cy);c.stroke();c.fillStyle='#a4d8a4';c.beginPath();c.arc(left,65,23,0,2*Math.PI);c.fill();c.fillStyle='#86bced';c.beginPath();c.arc(left,185,23,0,2*Math.PI);c.fill();c.fillStyle='#f1bc68';c.beginPath();c.arc(right,cy,30,0,2*Math.PI);c.fill();c.fillStyle='#172019';c.font='bold 15px sans-serif';c.textAlign='center';c.fillText('2',left,70);c.fillText('3',left,190);c.fillText(sum.toFixed(1),right,130);c.fillStyle='#dce8dc';c.font='12px sans-serif';c.fillText(`× ${a.toFixed(1)}`,w*.47,75);c.fillText(`× ${b.toFixed(1)}`,w*.47,190);c.fillText('相加',right,cy+50);}
  w1.oninput=draw;w2.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function neuronGateExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：改变输入，观察加权结果能否通过门槛</b><p><label>输入 1 <input class="x1" type="range" min="0" max="5" step="0.5" value="2"></label> <label>输入 2 <input class="x2" type="range" min="0" max="5" step="0.5" value="3"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:240px" aria-label="加权求和经过门槛得到分类"></canvas><p>这里两个权重都固定为 1；达到门槛 5 时输出 B，否则输出 A。</p></div>`;
  const canvas=root.querySelector('canvas'),x1=root.querySelector('.x1'),x2=root.querySelector('.x2');function draw(){const a=+x1.value,b=+x2.value,sum=a+b,on=sum>=5;root.querySelector('.readout').textContent=`${a.toFixed(1)} × 1 + ${b.toFixed(1)} × 1 = ${sum.toFixed(1)}　→　${on?'达到门槛：B':'未达到门槛：A'}`;const w=canvas.clientWidth||260,h=240,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const xs=[w*.16,w*.48,w*.82];c.strokeStyle='#718577';c.lineWidth=2;c.beginPath();c.moveTo(xs[0],65);c.lineTo(xs[1],120);c.moveTo(xs[0],175);c.lineTo(xs[1],120);c.lineTo(xs[2],120);c.stroke();for(const [x,y,color,text] of [[xs[0],65,'#a4d8a4',a.toFixed(1)],[xs[0],175,'#86bced',b.toFixed(1)],[xs[1],120,'#f1bc68',sum.toFixed(1)],[xs[2],120,on?'#86bced':'#a4d8a4',on?'B':'A']]){c.fillStyle=color;c.beginPath();c.arc(x,y,25,0,2*Math.PI);c.fill();c.fillStyle='#172019';c.textAlign='center';c.font='bold 14px sans-serif';c.fillText(text,x,y+5);}c.fillStyle='#dce8dc';c.font='12px sans-serif';c.fillText('相加',xs[1],165);c.fillText('门槛 5',xs[2],165);}
  x1.oninput=draw;x2.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function neuronBoundaryExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：移动输入点，观察它在分界线哪一侧</b><p><label>输入 1 <input class="x1" type="range" min="0" max="10" step="0.5" value="2"></label> <label>输入 2 <input class="x2" type="range" min="0" max="10" step="0.5" value="3"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="单元判断与二维分类边界"></canvas><p>线上及右上方满足门槛，预测 B；另一侧预测 A。</p></div>`;
  const canvas=root.querySelector('canvas'),x1=root.querySelector('.x1'),x2=root.querySelector('.x2');function draw(){const a=+x1.value,b=+x2.value,sum=a+b;root.querySelector('.readout').textContent=`${a.toFixed(1)} + ${b.toFixed(1)} = ${sum.toFixed(1)}　→　${sum>=5?'达到 5，预测 B':'小于 5，预测 A'}`;const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,u=size/10,X=v=>left+v*u,Y=v=>bottom-v*u;
    c.fillStyle='#263b50';c.fillRect(left,bottom-size,size,size);c.fillStyle='#263e2d';c.beginPath();c.moveTo(X(0),Y(0));c.lineTo(X(5),Y(0));c.lineTo(X(0),Y(5));c.closePath();c.fill();c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#b8caba';c.font='11px sans-serif';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('输入 2',left+4,bottom-size+12);c.textAlign='right';c.fillText('输入 1',left+size,h-3);c.strokeStyle='#f1bc68';c.lineWidth=2;c.beginPath();c.moveTo(X(0),Y(5));c.lineTo(X(5),Y(0));c.stroke();c.fillStyle='#f1bc68';c.beginPath();c.arc(X(a),Y(b),7,0,2*Math.PI);c.fill();}
  x1.oninput=draw;x2.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function weightedBoundaryExperiment(root) {
  root.innerHTML=`<div class="callout"><b>任务：调整权重，观察判断线转动</b><p><label>权重 1 <input class="w1" type="range" min="0.5" max="2" step="0.1" value="1"></label> <label>权重 2 <input class="w2" type="range" min="0.5" max="2" step="0.1" value="1"></label></p><div class="formula readout" aria-live="polite"></div><canvas style="width:100%;height:300px" aria-label="权重改变分类边界"></canvas><p>金线上的组合刚好达到 5；蓝色区域预测 B，绿色区域预测 A。</p></div>`;
  const canvas=root.querySelector('canvas'),w1=root.querySelector('.w1'),w2=root.querySelector('.w2');function draw(){const a=+w1.value,b=+w2.value;root.querySelector('.readout').textContent=`输入 1 × ${a.toFixed(1)} + 输入 2 × ${b.toFixed(1)} ≥ 5 → B`;const w=canvas.clientWidth||260,h=300,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const size=Math.max(1,Math.min(w-65,h-55)),left=40+(w-65-size)/2,bottom=h-35,u=size/10,X=v=>left+v*u,Y=v=>bottom-v*u,ix=5/a,iy=5/b;
    c.fillStyle='#263b50';c.fillRect(left,bottom-size,size,size);c.fillStyle='#263e2d';c.beginPath();c.moveTo(X(0),Y(0));c.lineTo(X(ix),Y(0));c.lineTo(X(0),Y(iy));c.closePath();c.fill();c.strokeStyle='#718577';c.beginPath();c.moveTo(left,bottom-size);c.lineTo(left,bottom);c.lineTo(left+size,bottom);c.stroke();c.fillStyle='#b8caba';c.font='11px sans-serif';c.textAlign='center';for(let v=0;v<=10;v+=2){c.fillText(String(v),X(v),bottom+14);if(v){c.textAlign='right';c.fillText(String(v),left-6,Y(v)+4);c.textAlign='center';}}c.textAlign='left';c.fillText('输入 2',left+4,bottom-size+12);c.textAlign='right';c.fillText('输入 1',left+size,h-3);c.strokeStyle='#f1bc68';c.lineWidth=2;c.beginPath();c.moveTo(X(0),Y(iy));c.lineTo(X(ix),Y(0));c.stroke();}
  w1.oninput=draw;w2.oninput=draw;draw();const observer=new ResizeObserver(()=>{if(!canvas.isConnected){observer.disconnect();return;}draw();});observer.observe(canvas);
}
function experiment(kind) {
  return root => {
    root.innerHTML = `<div class="callout"><b class="task"></b><p><label>拖动这里 <input type="range" min="0" max="10" step="1" value="3" aria-label="调整数值"></label></p><div class="formula result" aria-live="polite"></div><canvas style="width:100%;height:250px" aria-label="交互图示"></canvas><p class="hint"></p></div>`;
    const slider=root.querySelector('input'), canvas=root.querySelector('canvas'), result=root.querySelector('.result'), hint=root.querySelector('.hint'), task=root.querySelector('.task');
    if(kind==='rate'){slider.min='1';}
    if(kind==='interval'){slider.min='1';slider.max='10';slider.value='8';}
    function draw(){
      const n=Number(slider.value), w=canvas.clientWidth || 260, h=250, dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;
      const c=canvas.getContext('2d');c.scale(dpr,dpr);c.clearRect(0,0,w,h);c.font='14px sans-serif';c.fillStyle='#bdbdbd';
      if(kind==='number'){
        task.textContent='任务：从 3 拖到 7，观察增加了多少';result.textContent=`现在有 ${n} 个点`;hint.textContent='向右拖，数量增加；向左拖，数量减少。';
        for(let i=0;i<n;i++){c.fillStyle='#ededed';c.beginPath();c.arc(30+i*(w-60)/10,h/2,10,0,Math.PI*2);c.fill();}
        return;
      }
      if(kind==='machine'){
        task.textContent='任务：输入 2 和 5，观察输出';result.textContent=`输入 ${n} → 加 2 → 输出 ${n+2}`;hint.textContent='规则不变，输入改变，输出也跟着改变。';
        c.fillStyle='#ededed';c.font='22px sans-serif';c.fillText(`${n}      →      + 2      →      ${n+2}`,25,125);return;
      }
      const plotSize=Math.max(1,Math.min(w-65,h-50)), left=40+Math.max(0,(w-65-plotSize)/2), bottom=h-30, sx=plotSize/10, sy=plotSize/10, X=x=>left+x*sx, Y=y=>bottom-y*sy;
      c.strokeStyle='#888888';c.lineWidth=1;c.beginPath();c.moveTo(left,bottom-plotSize);c.lineTo(left,bottom);c.lineTo(left+plotSize,bottom);c.stroke();
      // 同一映射用于刻度、曲线、点与辅助线；标注实际单位。
      c.font='11px sans-serif'; c.fillStyle='#bdbdbd'; c.strokeStyle='#888888';
      for (let tick=0;tick<=10;tick+=2) {
        c.beginPath();c.moveTo(X(tick),bottom);c.lineTo(X(tick),bottom+4);c.stroke();
        c.textAlign='center';c.fillText(String(tick),X(tick),bottom+16);
        if(tick>0){c.beginPath();c.moveTo(left-4,Y(tick));c.lineTo(left,Y(tick));c.stroke();c.textAlign='right';c.fillText(String(tick),left-7,Y(tick)+4);}
      }
      c.textAlign='left';c.fillText(kind==='rate'?'距离（公里）':kind==='training'?'错误':kind==='downhill'?'高度':'输出',left+5,20);
      c.textAlign='right';c.fillText(kind==='rate'?'时间（小时）':kind==='training'?'参数':kind==='downhill'?'位置':'输入',left+plotSize,h-2);c.textAlign='left';
      if(kind==='point'){
        task.textContent='任务：找到输入 2 和输入 5 对应的点';result.textContent=`输入 ${n}，输出 ${n}`;hint.textContent='点的位置由两个数决定：先向右，再向上。';
        c.strokeStyle='#777777';c.setLineDash([4,4]);c.beginPath();c.moveTo(X(n),bottom);c.lineTo(X(n),Y(n));c.lineTo(left,Y(n));c.stroke();c.setLineDash([]);
        c.fillStyle='#f1bc68';c.beginPath();c.arc(X(n),Y(n),6,0,Math.PI*2);c.fill();return;
      }
      if(kind==='line'){
        task.textContent='任务：从输入 2 拖到 5，比较输出';result.textContent=`输入 ${n} → 输出 ${n}`;hint.textContent='把所有输入和输出的点连起来，就得到这条线。';
        c.strokeStyle='#ededed';c.lineWidth=3;c.beginPath();c.moveTo(X(0),Y(0));c.lineTo(X(10),Y(10));c.stroke();c.fillStyle='#f1bc68';c.beginPath();c.arc(X(n),Y(n),6,0,Math.PI*2);c.fill();return;
      }
      if(kind==='change'){
        task.textContent='任务：从 2 拖到 6，观察两种变化';result.textContent=`输入增加 ${n}，输出增加 ${n}`;hint.textContent='这条线里，输入每增加 1，输出也增加 1。';
        c.strokeStyle='#ededed';c.lineWidth=3;c.beginPath();c.moveTo(X(0),Y(0));c.lineTo(X(10),Y(10));c.stroke();c.fillStyle='#f1bc68';for(const x of [0,n]){c.beginPath();c.arc(X(x),Y(x),6,0,Math.PI*2);c.fill();}return;
      }
      if(kind==='rate'){
        task.textContent='任务：改变走路时间，观察平均速度';result.textContent=`${(n/2).toFixed(1)} 小时走了 ${n} 公里；每小时平均走 2 公里`;hint.textContent='平均速度 = 距离 ÷ 时间。这里每小时都走 2 公里。';
        c.strokeStyle='#ededed';c.lineWidth=3;c.beginPath();c.moveTo(X(0),Y(0));c.lineTo(X(5),Y(10));c.stroke();c.fillStyle='#f1bc68';c.beginPath();c.arc(X(n/2),Y(n),6,0,Math.PI*2);c.fill();return;
      }
      if(kind==='downhill' || kind==='training'){
        const f=x=>(x-5)*(x-5)/3, slope=2*(n-5)/3;
        task.textContent=kind==='training'?'任务：调整参数，找到错误最低的位置':'任务：把点移到左边、右边和最低点';
        result.textContent=kind==='training'?`参数 ${n}　·　错误 ${f(n).toFixed(2)}　·　导数 ${slope.toFixed(2)}`:`位置 ${n}　·　高度 ${f(n).toFixed(2)}　·　导数 ${slope.toFixed(2)}`;
        hint.textContent=n<5?'这里向右是下坡：导数是负数。':n>5?'这里向左是下坡：导数是正数。':'到达最低点：这里的导数是 0。';
        c.strokeStyle='#ededed';c.lineWidth=3;c.beginPath();for(let i=0;i<=100;i++){const x=i/10;i?c.lineTo(X(x),Y(f(x))):c.moveTo(X(x),Y(f(x)));}c.stroke();
        c.fillStyle='#f1bc68';c.beginPath();c.arc(X(n),Y(f(n)),6,0,Math.PI*2);c.fill();return;
      }
      const t=2, step=n/10, f=x=>x*x/10;
      task.textContent='任务：把观察间隔从大拖到小';result.textContent=`观察间隔 ${step.toFixed(1)}；平均变化率 ${((f(t+step)-f(t))/step).toFixed(2)}`;hint.textContent=`间隔缩小时，平均变化率靠近 ${(2*t/10).toFixed(1)}；这就是这一点的导数。`;
      c.strokeStyle='#ededed';c.lineWidth=3;c.beginPath();for(let i=0;i<=100;i++){const x=i/10;i?c.lineTo(X(x),Y(f(x))):c.moveTo(X(x),Y(f(x)));}c.stroke();c.strokeStyle='#f1bc68';c.beginPath();c.moveTo(X(t),Y(f(t)));c.lineTo(X(t+step),Y(f(t+step)));c.stroke();for(const x of [t,t+step]){c.fillStyle='#f1bc68';c.beginPath();c.arc(X(x),Y(f(x)),6,0,Math.PI*2);c.fill();}
    }
    slider.addEventListener('input',draw);draw();
    const observer = new ResizeObserver(() => { if (!canvas.isConnected) { observer.disconnect(); return; } draw(); });
    observer.observe(canvas);
  };
}
export const LESSONS = [
 {id:'start',nav:'开始 · 学习地图',kicker:'从零开始',title:'用动手的方式，理解人工智能',lead:'你会编程；数学从最基础的数和图开始。每次只走一小步。',blocks:`<div class="formula">数 → 输入与输出 → 图像 → 变化 → 导数 → 模型</div><p class="body-text">每课先拖一拖，观察变化，再回答问题。看不懂时可以随时返回上一课。</p><div class="callout"><b>当前开放</b>第一阶段：数、图像和变化。这只是通向 AI 研究的起点，后续课程将逐步建设。</div>`,mount:null,quiz:[]},
 {id:'numbers',nav:'1 · 数与变化',kicker:'第一阶段 · 1',title:'数：有多少？',lead:'从你已经熟悉的东西开始。',blocks:'<p class="body-text">一个点代表一个东西。拖动滑块，看看数量如何变化。</p>',mount:experiment('number'),quiz:[question('从 3 个点增加到 7 个点，多了几个？',['3','4','7'],1,'7 − 3 = 4。')]},
 {id:'machine',nav:'2 · 输入与输出',kicker:'第一阶段 · 2',title:'一个数字进去，另一个出来',lead:'就像程序里的函数：输入经过规则，得到输出。',blocks:'<p class="body-text">这台机器的规则是：给输入加 2。</p>',mount:experiment('machine'),quiz:[question('输入 5，规则是加 2，输出是多少？',['2','5','7'],2,'5 + 2 = 7。')]},
 {id:'point',nav:'3 · 图上的点',kicker:'第一阶段 · 3',title:'把输入和输出画出来',lead:'横着看输入，竖着看输出。',blocks:'<p class="body-text">这次机器的规则是“输出等于输入”。每一对输入和输出，都可以画成一个点。</p>',mount:experiment('point'),quiz:[question('输入 4，输出等于输入。点对应哪一对数？',['4 和 4','4 和 2','0 和 4'],0,'输入是 4，输出也是 4。')]},
 {id:'line',nav:'4 · 从点到线',kicker:'第一阶段 · 4',title:'很多点，连成一条线',lead:'一条线可以展示很多组输入和输出。',blocks:'<p class="body-text">移动金色的点，看看它是否一直落在白色线上。</p>',mount:experiment('line'),quiz:[question('白色线上的每个点代表什么？',['一组输入和输出','一个完全不同的规则','一次训练'],0,'每个点都对应一组输入和输出。')]},
 {id:'change',nav:'5 · 比较变化',kicker:'第一阶段 · 5',title:'输入变了，输出变多少？',lead:'先比较两个位置，再谈变化快慢。',blocks:'<p class="body-text">金色点从起点移动；比较输入和输出各自增加了多少。</p>',mount:experiment('change'),quiz:[question('这条线上输入增加 4，输出增加多少？',['1','4','8'],1,'这条线的规则是输出等于输入。')]},
 {id:'rate',nav:'6 · 平均变化率',kicker:'第一阶段 · 6',title:'每一小时，变化多少？',lead:'用除法比较变化的快慢。',blocks:'<p class="body-text">平均速度 = 距离 ÷ 时间。平均变化率也是同样的想法：输出变化 ÷ 输入变化。</p>',mount:experiment('rate'),quiz:[question('走 3 小时，共走 6 公里，平均每小时走多少？',['2 公里','3 公里','6 公里'],0,'6 ÷ 3 = 2。')]},
 {id:'speed-now',nav:'7 · 此刻的速度',kicker:'第一阶段 · 7',title:'速度表：现在有多快？',lead:'先看小车，再给这个熟悉的想法起个名字。',blocks:'<p class="body-text">这辆车越来越快。白色线段是接下来一段时间走过的路。</p>',mount:speedExperiment,quiz:[question('把观察时间缩短，平均速度会越来越接近什么？',['此刻的速度','总距离','总时间'],0,'观察时间越短，就越接近速度表显示的此刻速度。')]},
 {id:'derivative',nav:'8 · 图上的导数',kicker:'第一阶段 · 8',title:'把速度画在图上',lead:'缩短观察间隔，看看平均变化率靠近什么。',blocks:'<p class="body-text">类似上一课的小车，这张图展示另一次运动。橙线连接两个时刻；缩短间隔，观察平均变化率如何接近这一刻的变化率。</p>',mount:experiment('interval'),quiz:[question('两个点越来越靠近时，平均变化率接近什么？',['起点的瞬时变化率','输出一定为零','输入的总和'],0,'当这个比值趋近一个确定的数，它就是该点的导数。')]},
 {id:'slope-direction',nav:'9 · 导数与方向',kicker:'第一阶段 · 9',title:'导数告诉你哪边是下坡',lead:'像站在山坡上：先看脚下是上升还是下降。',blocks:'<p class="body-text">横轴是位置，纵轴是高度。拖动金色点，观察导数的正负。</p>',mount:experiment('downhill'),quiz:[question('点在最低点右边，往哪里走会降低高度？',['向左','向右','保持不动'],0,'右边的导数为正，向左走是下坡。'),question('图中最低点的导数是多少？',['负数','0','正数'],1,'最低点处曲线暂时变平，导数为零。')]},
 {id:'training-intro',nav:'10 · 从下坡到训练',kicker:'第一阶段 · 10',title:'训练模型：把错误降下来',lead:'把山坡换成错误，找低点的方法没有变。',blocks:'<div class="formula">位置 → 模型参数　　高度 → 错误</div><p class="body-text">假设横轴是可以调节的参数，纵轴是模型的错误。移动金色点，找到错误最小的位置。</p>',mount:experiment('training'),quiz:[question('如果点在最低点右边，参数应该先怎么调整才能减小错误？',['减小参数','增加参数'],0,'向左调整，错误会降低。'),question('在这个例子里，训练要寻找什么？',['错误最低的位置','最高的位置','最大的参数'],0,'这里的目标是找到错误最小的参数。')]},
 {id:'model-prediction',nav:'11 · 做一个预测',kicker:'第二阶段 · 1',title:'模型：用规则做预测',lead:'先做一个你能亲手调整的简单模型。',blocks:'<p class="body-text">三件商品的预测总价 = 数量 × 每件价格。拖动每件价格，观察预测如何变化。</p>',mount:modelExperiment('prediction'),quiz:[question('每件 4 元，3 件预测多少钱？',['7 元','12 元','16 元'],1,'3 × 4 = 12。')]},
 {id:'model-error',nav:'12 · 预测与实际',kicker:'第二阶段 · 2',title:'误差：预测差了多少？',lead:'把预测和实际放在一起比较。',blocks:'<p class="body-text">三件商品的实际总价是 12 元。误差 = 预测 − 实际。</p>',mount:modelExperiment('error'),quiz:[question('预测 9 元，实际 12 元，误差是多少？',['−3 元','3 元','21 元'],0,'9 − 12 = −3，表示预测低了 3 元。'),question('误差为 0 说明什么？',['预测与实际相同','每件价格为 0','没有商品'],0,'预测减实际等于 0，说明两者相同。')]},
 {id:'error-cancel',nav:'13 · 误差会抵消',kicker:'第二阶段 · 3',title:'两个错误，加起来却是零？',lead:'用同一个预测值，分别预测两个实际值。',blocks:'<p class="body-text">实际值分别是 3 和 7。拖动预测值，观察两个误差。</p>',mount:lossExperiment('cancel'),quiz:[question('预测都是 5，实际分别是 3 和 7。误差相加为 0，说明什么？',['两个都预测正确','正负误差抵消了'],1,'两个误差分别是 +2 和 −2，两个预测都不准确。')]},
 {id:'loss-square',nav:'14 · 用损失衡量错误',kicker:'第二阶段 · 4',title:'损失：给错误打分',lead:'先平方，再平均，就不会被正负抵消骗到。',blocks:'<p class="body-text">把每个误差乘以自己，再把结果取平均。这个分数叫平均平方误差，越小代表这两个预测整体越接近实际。</p>',mount:lossExperiment('square'),quiz:[question('误差是 +2 和 −2，平方后分别是多少？',['4 和 4','4 和 −4','2 和 −2'],0,'2 × 2 = 4，−2 × −2 = 4。'),question('这个例子里平均平方误差越小，代表什么？',['整体预测越接近实际','预测值越大','样本越多'],0,'损失衡量预测与实际的差距。')]},
 {id:'gradient-step',nav:'15 · 自动走下坡',kicker:'第二阶段 · 5',title:'让模型自己走一步',lead:'刚才你手动调整预测；现在让导数告诉它往哪边走。',blocks:'<p class="body-text">沿用上一课：实际值是 3 和 7，曲线显示不同预测对应的平均平方误差。按“走一步”，看金色点如何移动。</p><div class="callout"><b>更新规则</b>新的预测 = 现在的预测 − 步长 × 导数。导数指向上坡，减去它就朝下坡走。</div>',mount:trainingExperiment,quiz:[question('当前导数为正，要向下坡走，预测应如何变化？',['减小','增加'],0,'减去正数，预测就会减小。'),question('步长太大可能发生什么？',['跨过低点，甚至越走越远','一定一次到达低点','损失一定变成零'],0,'步子过大可能反复跨过最低点并发散。')]},
 {id:'training-cycle',nav:'16 · 训练的循环',kicker:'第二阶段 · 6',title:'训练：四步反复进行',lead:'按按钮，一步一步拆开训练过程。',blocks:'<div class="formula">预测 → 计算损失 → 看导数 → 更新 → 再预测</div><p class="body-text">沿用实际值 3 和 7。每次更新后，再重复同样的步骤。</p>',mount:cycleExperiment,quiz:[question('计算损失之后，更新之前要看什么？',['导数','重新选择实际值','删除数据'],0,'导数告诉我们损失在当前位置的变化方向。'),question('更新后为什么还要再预测？',['检查新的参数产生什么结果，并继续调整','让数据变得更大','让导数永远等于 0'],0,'每轮用更新后的参数重新计算，才能继续降低损失。')]},
 {id:'line-model',nav:'17 · 会变化的预测',kicker:'第二阶段 · 7',title:'输入不同，预测也不同',lead:'模型不必对所有情况都给同一个答案。',blocks:'<p class="body-text">用商品数量预测总价：数量 × 单价。调整单价，让预测线贴近实际数据。</p>',mount:lineModel,quiz:[question('如果单价为 2 元，3 件商品的预测价格是多少？',['2 元','5 元','6 元'],2,'数量 × 单价：3 × 2 = 6。'),question('调整单价时，图中什么发生变化？',['预测线的倾斜程度','实际数据点的位置','坐标轴的单位'],0,'单价决定数量每增加 1 时预测价格增加多少。')]},
 {id:'line-bias',nav:'18 · 第二个旋钮',kicker:'第二阶段 · 8',title:'加上基础费用',lead:'除了单价，还可以调整一个固定的起步费用。',blocks:'<p class="body-text">想象商品总价还要加一笔固定包装费。拖动两个滑块，观察预测线的变化。</p><div class="formula">预测价格 = 数量 × 单价 + 基础费用</div>',mount:root=>lineModel(root,true),quiz:[question('只增加基础费用，预测线会怎样？',['整体向上移动','倾斜程度改变','实际数据点移动'],0,'每个预测都增加相同金额，线整体向上移动。'),question('只增加单价，会怎样？',['线变得更陡','线整体平移但倾斜不变','数据点消失'],0,'数量每增加 1，预测价格增加更多。')]},
 {id:'train-two-parameters',nav:'19 · 两个参数一起训练',kicker:'第二阶段 · 9',title:'两个旋钮，自动调整',lead:'把手动调线的过程交给训练循环。',blocks:'<p class="body-text">沿用上一课的三个数据点。每一步都用全部数据计算误差，并同时调整单价和基础费用。</p>',mount:twoParameterTraining,quiz:[question('绿色数据点在训练中扮演什么角色？',['提供实际值，用来比较预测','由模型每一步重新生成','表示下一步的参数'],0,'训练根据实际值与预测之间的误差调整参数。'),question('图中灰线代表什么？',['更新前的预测','实际数据','坐标轴'],0,'灰线保留上一步，方便比较更新的效果。')]},
 {id:'new-data',nav:'20 · 见过与没见过',kicker:'第二阶段 · 10',title:'贴住已知点，就一定会预测吗？',lead:'先调整曲线，再看看它对新数据的表现。',blocks:'<p class="body-text">绿色点用于调整模型；蓝色点暂时藏起来，代表没有参与调整的新数据。</p>',mount:generalizationExperiment,quiz:[question('为什么要看没有参与调整的新数据？',['检查模型面对新情况的表现','让训练点移动','保证每次预测完全正确'],0,'新数据可以帮助我们观察模型能否推广到没有见过的样本。'),question('训练数据误差很小，能否保证新数据误差也很小？',['一定能','不能保证'],1,'模型可能贴合训练数据的偶然波动，新数据需要单独检验。')]},
 {id:'fit-comparison',nav:'21 · 模型太简单或太复杂',kicker:'第二阶段 · 11',title:'贴得越紧，真的越好吗？',lead:'切换三种模型，比较训练数据和新数据上的表现。',blocks:'<p class="body-text">沿用上一课的数据。看看简单、适中、复杂三条预测线分别能捕捉什么。</p>',mount:fitComparison,quiz:[question('复杂曲线经过所有训练点，是否一定适合新数据？',['一定适合','不一定'],1,'需要用没有参与调整的数据检验。'),question('如果模型太简单，连训练数据的趋势都抓不住，这叫做什么？',['欠拟合','过拟合','数据增强'],0,'模型没有学到足够的规律，称为欠拟合。'),question('模型过分贴合训练样本的偶然变化，新数据表现较差，称为什么？',['过拟合','欠拟合','梯度下降'],0,'这就是过拟合；需要通过新数据评估。')]},
 {id:'data-split',nav:'22 · 数据分成三组',kicker:'第二阶段 · 12',title:'怎样公平地检查模型？',lead:'把数据分开，让模型面对真正没有见过的样本。',blocks:'<p class="body-text">点击三个阶段，看看每组数据什么时候使用。</p>',mount:dataSplitExperiment,quiz:[question('哪一组用来调整模型参数？',['训练集','测试集','最终评估结果'],0,'训练集用于训练，也就是调整参数。'),question('反复比较不同模型时，应该使用哪组数据？',['验证集','测试集','把测试集加入训练集'],0,'用验证集选择方案；保留测试集做最终评估。'),question('测试集主要在什么时候使用？',['确定方案后做最终评估','每次调整参数','用来挑选每一个模型'],0,'测试集不参与训练和方案选择，才能提供更独立的最终评估。')]},
 {id:'data-leakage',nav:'23 · 测试答案泄漏',kicker:'第二阶段 · 13',title:'提前看答案，测试还公平吗？',lead:'切换两种做法，观察同一道题是否同时出现在训练和测试中。',blocks:'<p class="body-text">把测试数据想成一道留到最后的考题。星号代表这道题。</p>',mount:leakageExperiment,quiz:[question('训练时提前看到了测试答案，测试得分能否可靠说明新题表现？',['不能','一定能'],0,'这道测试题已经不再独立，得分可能过于乐观。'),question('怎样保留更公平的最终评估？',['测试数据不参与训练和模型选择','把测试答案加入训练数据','反复根据测试成绩挑选方案'],0,'先确定方案，再用独立测试数据评估。')]},
 {id:'classification',nav:'24 · 从预测数字到分类',kicker:'第三阶段 · 1',title:'这次不猜多少，猜是哪一类',lead:'拖动分界线，让模型把两类样本分开。',blocks:'<p class="body-text">每个样本有一个数字特征。模型根据它的位置预测 A 类或 B 类。</p>',mount:classificationExperiment,quiz:[question('这个模型的输出是什么？',['A 或 B 类','商品总价','导数'],0,'这里模型输出类别，而不是一个价格。'),question('图中的红色 × 表示什么？',['预测类别与实际类别不一致','一个新的坐标轴','分类一定正确'],0,'× 标记了当前被分错的样本。')]},
 {id:'accuracy',nav:'25 · 分类正确率',kicker:'第三阶段 · 2',title:'正确率高，就一定好吗？',lead:'两个模型都答对 8 个，看看它们错在哪里。',blocks:'<p class="body-text">每个图形代表一个样本：颜色和形状表示实际类别，下方显示模型的预测。</p>',mount:accuracyExperiment,quiz:[question('10 个样本答对 8 个，正确率是多少？',['80%','8%','20%'],0,'正确率 = 答对数量 ÷ 总数量 = 8 ÷ 10。'),question('两个模型正确率相同，能否保证它们对 B 类的表现相同？',['不能','一定相同'],0,'要分别观察每一类的结果。')]},
 {id:'classification-errors',nav:'26 · 漏掉与误报',kicker:'第三阶段 · 3',title:'错了，有两种不同的错',lead:'目标是找出 B 类。点击样本，亲手改变预测。',blocks:'<p class="body-text">实际类别保持不变；每次点击只改变模型的预测。</p>',mount:classificationErrors,quiz:[question('实际是 B，模型猜 A，是什么？',['漏掉 B','误报 B','正确找到 B'],0,'目标 B 存在却没有被找出，这是漏掉。'),question('实际是 A，模型猜 B，是什么？',['误报 B','漏掉 B','正确找到 B'],0,'把不是 B 的样本当成 B，是误报。')]},
 {id:'precision-recall',nav:'27 · 精确率与召回率',kicker:'第三阶段 · 4',title:'报得准，还是找得全？',lead:'两个问题，分母不同。',blocks:'<div class="formula">精确率：报出来的，有多少是对的？<br>召回率：实际存在的，找到了多少？</div><p class="body-text">点击样本，看看两个比例怎样变化。</p>',mount:precisionRecallExperiment,quiz:[question('报出 2 个 B，其中 1 个是真的 B，精确率是多少？',['50%','100%','0%'],0,'精确率 = 找对的 B ÷ 报出的 B = 1 ÷ 2。'),question('实际有 2 个 B，找到了 1 个，召回率是多少？',['50%','100%','0%'],0,'召回率 = 找对的 B ÷ 实际 B 的数量 = 1 ÷ 2。')]},
 {id:'threshold',nav:'28 · 分类门槛',kicker:'第三阶段 · 5',title:'门槛高一点，还是低一点？',lead:'模型先给出分数，再根据门槛决定是否报为 B。',blocks:'<p class="body-text">每个点的位置是模型给它的分数。绿色圆点是实际 A，蓝色方块是实际 B。</p>',mount:thresholdExperiment,quiz:[question('降低门槛，会让多少样本被报为 B？',['更多或一样多','更少','一定全部正确'],0,'分数达到门槛就报 B；降低门槛不会减少报出的数量。'),question('如果没有任何样本被报为 B，精确率是多少？',['无法定义，因为分母为零','100%','0% 一定成立'],0,'没有报出样本时，精确率的分母为零。')]},
 {id:'two-features',nav:'29 · 两个特征',kicker:'第三阶段 · 6',title:'用两个数字一起分类',lead:'一个点的位置同时表示两项特征。',blocks:'<p class="body-text">横轴是特征 1，纵轴是特征 2。金色线是分类边界；两项特征的和达到门槛时，预测为 B。</p>',mount:twoFeaturesExperiment,quiz:[question('点的位置由什么决定？',['两个特征的数值','模型的正确率','数据集大小'],0,'横坐标和纵坐标分别表示两个特征。'),question('特征分别是 4 和 5，门槛是 8，预测什么？',['B','A'],0,'4 + 5 = 9，达到门槛 8，因此预测 B。')]},
 {id:'nonlinear',nav:'30 · 直线的局限',kicker:'第三阶段 · 7',title:'一条直线分不开怎么办？',lead:'当一类被另一类包围，尝试改变边界的形状。',blocks:'<p class="body-text">直线左边预测 A、右边预测 B；圆形边界则把圆内预测为 A、圆外预测为 B。</p>',mount:nonlinearExperiment,quiz:[question('这个例子中，为什么圆形边界可能更合适？',['A 类在中间，B 类围在周围','圆形总比直线好','数据没有两个特征'],0,'边界形状需要适应数据的分布。'),question('复杂边界是否一定能在新数据上表现更好？',['不一定','一定'],0,'还需要用未参与训练的数据评估，避免过拟合。')]},
 {id:'distance',nav:'31 · 点到中心的距离',kicker:'第三阶段 · 8',title:'圆形边界：离中心有多远？',lead:'移动一个点，观察距离和分类结果。',blocks:'<p class="body-text">中心固定在 (5, 5)，蓝色圆的半径是 3。距离小于 3 判为 A，否则判为 B。</p>',mount:distanceExperiment,quiz:[question('一个点离中心的距离是 2，半径是 3。它在哪里？',['圆内','圆外'],0,'2 小于 3，点在圆内。'),question('点恰好在边界上，这个例子判为什么？',['B','A'],0,'这里约定只有距离严格小于 3 才判为 A。')]},
 {id:'square-root',nav:'32 · 从面积到边长',kicker:'第三阶段 · 9',title:'平方根：从面积找边长',lead:'先数方格，再反过来找边长。',blocks:'<p class="body-text">正方形的面积 = 边长 × 边长。平方根符号 √ 表示：找到平方后等于这个面积的非负数。</p>',mount:squareRootExperiment,quiz:[question('正方形面积是 9，边长是多少？',['3','9','18'],0,'3 × 3 = 9，所以 √9 = 3。'),question('√16 是多少？',['4','8','16'],0,'4 × 4 = 16。')]},
 {id:'pythagoras',nav:'33 · 距离怎样计算',kicker:'第三阶段 · 10',title:'横着走、竖着走，斜着有多远？',lead:'用方格和直角三角形理解距离。',blocks:'<p class="body-text">横向和纵向互相垂直，连接起点和终点的斜边就是两点之间的直线距离。</p>',mount:pythagorasExperiment,quiz:[question('横向长度 3、纵向长度 4，斜边长度是多少？',['5','7','25'],0,'3² + 4² = 25，平方为 25 的正数是 5。'),question('横向长度和纵向长度都变大时，直线距离会怎样？',['变大','变小','不变'],0,'两条边的平方和增加，因此直线距离增加。')]},
 {id:'nearest-neighbor',nav:'34 · 找最近的样本',kicker:'第三阶段 · 11',title:'离谁最近，就先参考谁',lead:'用刚学过的距离，给一个新样本分类。',blocks:'<p class="body-text">移动金色点，虚线连接距离最近的已知样本。若 A 和 B 同样近，这个实验暂不判定。</p>',mount:nearestNeighborExperiment,quiz:[question('新样本离一个 A 样本最近，这里的规则预测什么？',['A','B','无法预测任何情况'],0,'这个简单规则借用最近已知样本的类别。'),question('如果 A 和 B 的最近距离完全相同，这个实验如何处理？',['暂不判定','一定选 A','一定选 B'],0,'本实验明确把不同类别的等距离情况标为暂不判定。')]},
 {id:'neighbor-vote',nav:'35 · 邻居投票',kicker:'第三阶段 · 12',title:'不只看一个邻居',lead:'让附近的多个已知样本一起投票。',blocks:'<p class="body-text">选出最近的 K 个样本，每个样本投给自己的类别，票数多的类别成为预测。若第 K 位距离并列，这个实验暂不判定。</p>',mount:neighborVoteExperiment,quiz:[question('最近 3 个邻居中，2 个是 A，1 个是 B，预测什么？',['A','B'],0,'A 得 2 票，比 B 的 1 票多。'),question('改变邻居数量，预测类别是否可能改变？',['可能','绝不可能'],0,'参与投票的样本改变，票数和结果都可能改变。')]},
 {id:'neighbor-regions',nav:'36 · 分类区域',kicker:'第三阶段 · 13',title:'把每个位置的预测画出来',lead:'从一个点的投票，看到整个平面的预测。',blocks:'<p class="body-text">背景中的每一小格代表该位置的预测。切换邻居数量，比较区域的形状。</p>',mount:neighborRegions,quiz:[question('背景颜色表示什么？',['该位置的预测类别','已知样本的真实类别','模型训练次数'],0,'每一小格都用最近邻规则计算预测类别。'),question('改变邻居数量，分类区域是否可能变化？',['可能','不可能'],0,'每个位置参与投票的邻居可能改变。')]},
 {id:'distance-tie',nav:'37 · 距离并列怎么办',kicker:'第三阶段 · 14',title:'一样近，该选谁？',lead:'同样的数据，可以选择不同的并列处理规则。',blocks:'<p class="body-text">A 位于 2，B 位于 8。拖动新样本，观察它到两边的距离。</p>',mount:tieExperiment,quiz:[question('新样本在 5，A 在 2、B 在 8，它离谁更近？',['一样近','A','B'],0,'两边距离都是 3。'),question('并列时选择 A，是否证明 A 一定正确？',['不能证明','可以证明'],0,'这是事先约定的处理规则，并列本身不能证明哪个类别正确。')]},
 {id:'feature-scale',nav:'38 · 特征的尺度',kicker:'第三阶段 · 15',title:'数字大，就一定更重要吗？',lead:'同一组样本，尺度改变后，最近邻居可能改变。',blocks:'<p class="body-text">两项特征的数值范围不同。切换方式，看看它们对距离的影响。</p>',mount:featureScaleExperiment,quiz:[question('不做缩放时，哪个特征的数值差更容易主导距离？',['数值范围较大的特征','永远是第二个特征','两个特征必然一样'],0,'数值差更大时，对直接计算出的距离影响更大。'),question('特征缩放后，最近邻居可能改变吗？',['可能','不可能'],0,'不同特征对距离的相对影响改变，最近邻居也可能改变。')]},
 {id:'scaling',nav:'39 · 缩放到同一标尺',kicker:'第三阶段 · 16',title:'把不同范围放到同一标尺',lead:'原始位置不变，只换一种表示方式。',blocks:'<p class="body-text">这条标尺的最小值是 100，最大值是 200。拖动数值，观察它对应的 0–1 位置。</p>',mount:scalingExperiment,quiz:[question('100 到 200 的中点 150，缩放后是多少？',['0.5','1','150'],0,'150 位于范围的正中间，对应 0.5。'),question('原始数值为 200，缩放后是多少？',['1','0','2'],0,'最大值对应 1。')]},
 {id:'scaling-leak',nav:'40 · 缩放与数据泄漏',kicker:'第三阶段 · 17',title:'缩放的范围从哪里来？',lead:'先看训练集，再用同一把尺子处理新数据。',blocks:'<p class="body-text">训练样本是 100、150、200；测试样本是 300。比较两种选择范围的方法。</p>',mount:scalingLeakExperiment,quiz:[question('选缩放范围时，应使用哪组数据？',['训练集','训练集和测试集合在一起'],0,'先从训练集确定规则，再应用到验证集和测试集。'),question('新数据超过训练集最大值，缩放后能否大于 1？',['可以','不可能'],0,'沿用训练集的范围时，范围外的值可以映射到 1 以上。')]},
 {id:'weighted-sum',nav:'41 · 两个输入汇合',kicker:'第四阶段 · 1',title:'让两个输入一起影响输出',lead:'每个输入先乘自己的权重，然后相加。',blocks:'<p class="body-text">权重是可以调整的参数，决定对应输入对结果的影响。</p>',mount:weightedSumExperiment,quiz:[question('输入分别是 2 和 3，两个权重都是 1，输出是多少？',['5','6','1'],0,'2 × 1 + 3 × 1 = 5。'),question('如果第一个权重变成 0，第一个输入对相加结果有什么影响？',['没有影响','一定让输出变大','一定让输出变负'],0,'第一个输入乘以 0，贡献为 0。')]},
 {id:'neuron-gate',nav:'42 · 从加权到判断',kicker:'第四阶段 · 2',title:'加起来，再做判断',lead:'把加权求和接到前面学过的分类门槛。',blocks:'<p class="body-text">两个输入先相加；结果达到 5 时判为 B，否则判为 A。</p>',mount:neuronGateExperiment,quiz:[question('两个输入分别为 2 和 3，权重都是 1，门槛为 5，输出什么？',['B','A'],0,'2 + 3 = 5，达到门槛，因此输出 B。'),question('如果结果是 4，门槛是 5，输出什么？',['A','B'],0,'4 没有达到 5，输出 A。')]},
 {id:'neuron-boundary',nav:'43 · 判断画成直线',kicker:'第四阶段 · 3',title:'一个判断，变成一条线',lead:'同一个规则，可以写成计算，也可以画成图。',blocks:'<p class="body-text">沿用上一课：输入 1 + 输入 2 达到 5 时预测 B。金线上的点正好加起来等于 5。</p>',mount:neuronBoundaryExperiment,quiz:[question('输入 1 是 1，输入 2 是 4，点在哪里？',['分界线上','一定在 A 区域内部','图外'],0,'1 + 4 = 5，恰好在分界线上。'),question('这个例子里分界线上的点预测为哪类？',['B','A'],0,'规则是达到 5 就预测 B，包含等于 5。')]},
 {id:'weighted-boundary',nav:'44 · 权重改变边界',kicker:'第四阶段 · 4',title:'两个权重，改变一条线',lead:'拖动权重，看看不同输入对判断的影响。',blocks:'<p class="body-text">门槛固定为 5。金线上的输入组合，加权后恰好等于 5。</p>',mount:weightedBoundaryExperiment,quiz:[question('固定其他条件，增加权重 1 会让输入 1 的影响怎样变化？',['更大','更小','完全消失'],0,'输入 1 乘以更大的权重，对相加结果的贡献更大。'),question('权重改变时，分类边界会怎样？',['可能改变方向','永远不变','数据坐标自动改变'],0,'权重改变输入对判断的影响，边界也会改变。')]}
];
