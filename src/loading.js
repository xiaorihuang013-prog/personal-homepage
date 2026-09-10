// 资源加载跟踪器：登记异步素材，全部就绪后回调，用于「loading」封面。
let pending = 0;
let settled = false;
let onReady = null;

// 登记一个待加载资源，返回幂等的「完成」函数。
export function track() {
  pending += 1;
  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    pending -= 1;
    if (pending === 0 && !settled) {
      settled = true;
      if (onReady) onReady();
    }
  };
}

// 注册「全部加载完成」回调；若已全部完成则立即执行。
export function whenReady(cb) {
  if (settled || pending === 0) { cb(); return; }
  onReady = cb;
}
