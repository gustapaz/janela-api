// Integer-minute interval intersection. All intervals are half-open.
const busy = new StaticArray<i32>(1440);
const starts = new StaticArray<i32>(288);
const ends = new StaticArray<i32>(288);
const windowStarts = new StaticArray<i32>(721);
const windowEnds = new StaticArray<i32>(721);
let lo:i32=0, hi:i32=0, duration:i32=0, step:i32=0, padding:i32=0;
let count:i32=0, windows:i32=0, free:i32=0;
export function reset(start:i32,end:i32,length:i32,stride:i32,buffer:i32):void {
 lo=start;hi=end;duration=length;step=stride;padding=buffer;
 count=0;windows=0;free=0;
 for(let i=0;i<1440;i++) unchecked(busy[i]=0);
}
export function block(start:i32,end:i32):void {
 for(let i=max(lo,start-padding);i<min(hi,end+padding);i++) unchecked(busy[i]=1);
}
export function solve():i32 {
 count=0;windows=0;free=0;let begin:i32=-1;
 for(let i=lo;i<=hi;i++) {
  if(i<hi && unchecked(busy[i])==0) {free++;if(begin<0)begin=i;}
  else if(begin>=0) {
   unchecked(windowStarts[windows]=begin);unchecked(windowEnds[windows]=i);windows++;
   let first=lo+((begin-lo+step-1)/step)*step;
   for(let s=first;s+duration<=i;s+=step){unchecked(starts[count]=s);unchecked(ends[count]=s+duration);count++;}
   begin=-1;
  }
 }
 return count;
}
export function slotStart(i:i32):i32{return starts[i];}
export function slotEnd(i:i32):i32{return ends[i];}
export function windowStart(i:i32):i32{return windowStarts[i];}
export function windowEnd(i:i32):i32{return windowEnds[i];}
export function windowCount():i32{return windows;}
export function freeMinutes():i32{return free;}
