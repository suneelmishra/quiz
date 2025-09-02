
/* main.js - quiz logic with drag/drop, sounds, rewards, certificate */
let state = {
  category: null,
  qIndex: 0,
  score: 0,
  totalAnswered: 0,
  totalQuestions: 0,
  sound: true
};

function init(){
  state.sound = (localStorage.getItem('anvi_sound') !== 'false');
  // build categories nav
  const cats = Array.from(new Set(QUESTIONS.map(q=>q.category)));
  const nav = $('#categoryNav');
  nav.empty();
  cats.forEach((c,idx)=>{
    const btn = $('<button class="btn btn-sm" data-cat="'+c+'">'+c+'</button>');
    btn.on('click', ()=> selectCategory(c));
    nav.append(btn);
  });
  state.totalQuestions = QUESTIONS.length;
  $('#totalQ').text(state.totalQuestions);
  // bind general buttons
  $('#nextQ').on('click', ()=> changeQuestion(1));
  $('#prevQ').on('click', ()=> changeQuestion(-1));
  $('#resetQ').on('click', ()=> renderQuestion(true));
  $('#restartBtn').on('click', ()=> restartToWelcome());
  $('#homeBtn').on('click', ()=> window.location.href='index.html');
  $('#playAgain').on('click', ()=> restartGame());
  $('#viewCert').on('click', ()=> window.open('certificate.html','_blank'));
  $('#downloadCert').on('click', ()=> window.open('certificate.html','_blank'));

  // start with first category
  if(cats.length) selectCategory(cats[0]);

  // read sound preference from localStorage
  const pref = localStorage.getItem('anvi_sound');
  if(pref === null) localStorage.setItem('anvi_sound', 'true');
  state.sound = localStorage.getItem('anvi_sound') === 'true';
}

function playSound(kind){
  if(!state.sound) return;
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if(kind==='correct'){ o.frequency.value = 880; g.gain.value = 0.12; }
    else if(kind==='incorrect'){ o.frequency.value = 220; g.gain.value = 0.08; }
    else if(kind==='drag'){ o.frequency.value = 440; g.gain.value = 0.06; }
    o.start(); setTimeout(()=>{ o.stop(); ctx.close(); }, 200);
  }catch(e){ console.warn(e); }
}

function selectCategory(name){
  state.category = name; state.qIndex = 0;
  $('#categoryNav .btn').removeClass('active');
  $('#categoryNav .btn[data-cat="'+name+'"]').addClass('active');
  $('#endScreen').addClass('d-none');
  $('.card.glass').removeClass('d-none');
  renderQuestion();
}

function getQuestionsForCategory(cat){ return QUESTIONS.filter(q=>q.category===cat); }

function renderQuestion(reset=false){
  const qs = getQuestionsForCategory(state.category);
  if(!qs || qs.length===0){ $('#questionArea').html('<div>No questions</div>'); return; }
  if(state.qIndex < 0) state.qIndex = 0;
  if(state.qIndex >= qs.length) state.qIndex = qs.length-1;
  const q = qs[state.qIndex];
  $('#currentQ').text((state.qIndex+1) + ' (' + state.category + ')');
  $('#totalQ').text(state.totalQuestions);
  $('#scoreDisplay').text(state.score);

  let html = '<div class="mb-2 small text-white-50">Category: <strong>'+q.category+'</strong></div>';
  html += '<div class="h4 mb-3">'+q.prompt+'</div>';
  if(q.type === 'mcq'){
    html += '<div class="row">';
    q.choices.forEach((c, i)=>{
      html += '<div class="col-md-6"><div class="option-card p-3" draggable="true" data-choice="'+c+'" id="opt_'+i+'" tabindex="0">'+c+'</div></div>';
    });
    html += '</div>';
    html += '<div class="drop-zone mt-3" id="dropZone" aria-label="Drop answer here">Drag an answer here</div>';
  } else {
    html += '<div><input id="freeInput" class="form-control form-control-lg" placeholder="Type your answer here"></div>';
    html += '<div class="mt-3"><button id="submitInput" class="btn btn-primary">Submit Answer</button></div>';
  }
  $('#questionArea').html(html);

  attachInteractions(q);
  // update progress percent
  const percent = Math.round((state.totalAnswered/state.totalQuestions)*100);
  // update rewards area small
  $('#rewards').html('');
}

function attachInteractions(q){
  $('.option-card').off().on('dragstart', function(ev){
    if(state.sound) playSound('drag');
    ev.originalEvent.dataTransfer.setData('text/plain', $(this).data('choice'));
  }).on('click', function(){ handleAnswer($(this).data('choice'), q); }).on('keydown', function(e){ if(e.key==='Enter') $(this).click(); });

  const dz = $('#dropZone');
  dz.off().on('dragover', function(ev){ ev.preventDefault(); $(this).addClass('border-primary'); });
  dz.on('dragleave', function(ev){ $(this).removeClass('border-primary'); });
  dz.on('drop', function(ev){ ev.preventDefault(); $(this).removeClass('border-primary'); const val = ev.originalEvent.dataTransfer.getData('text/plain'); handleAnswer(val, q); });

  $('#submitInput').off().on('click', ()=>{ const val = $('#freeInput').val().trim(); handleAnswer(val, q); });
  $('#freeInput').off().on('keydown', function(e){ if(e.key==='Enter') $('#submitInput').click(); });
}

function normalize(s){ return String(s).trim().toLowerCase().replace(/\s+/g,' '); }

function handleAnswer(value, q){
  const area = $('#questionArea');
  if(area.data('answered-'+q.id)) return;
  area.data('answered-'+q.id, true);
  const correct = normalize(q.answer);
  const given = normalize(value);
  const isCorrect = (given === correct);
  if(isCorrect){
    state.score += 1;
    playSound('correct');
    area.addClass('correct');
    showReward(true);
  } else {
    playSound('incorrect');
    area.addClass('incorrect');
    showReward(false);
    if(q.type==='input'){
      $('#questionArea').append('<div class="mt-2 small text-white-50">Hint: Try again or press Next.</div>');
    }
  }
  state.totalAnswered += 1;
  $('#scoreDisplay').text(state.score);
  setTimeout(()=>{ area.removeClass('correct incorrect'); changeQuestion(1); }, 900);
}

function changeQuestion(delta){
  const qs = getQuestionsForCategory(state.category);
  state.qIndex += delta;
  if(state.qIndex < 0) state.qIndex = 0;
  if(state.qIndex >= qs.length){
    showEndScreen();
    return;
  }
  renderQuestion();
}

function showEndScreen(){
  $('.card.glass').addClass('d-none');
  $('#endScreen').removeClass('d-none');
  $('#finalScore').text(state.score + ' / ' + state.totalQuestions);
  const stickers = [];
  for(let i=0;i<Math.min(8, state.score); i++) stickers.push('<img class="sticker" src="assets/images/anvi.png" alt="sticker">');
  $('#rewards').html(stickers.join(''));
  if(state.score > state.totalQuestions*0.5) confetti();
  const res = { name: 'Anvi Mishra', score: state.score, total: state.totalQuestions, date: new Date().toLocaleDateString() };
  localStorage.setItem('anvi_last_result', JSON.stringify(res));
}

function restartGame(){
  state.score = 0; state.totalAnswered = 0; state.qIndex = 0;
  $('#endScreen').addClass('d-none');
  $('.card.glass').removeClass('d-none');
  if(state.category) renderQuestion();
}

function restartToWelcome(){
  localStorage.setItem('anvi_sound', state.sound);
  window.location.href = 'index.html';
}

function showReward(correct){
  const badge = $('<span class="badge-sticker ms-2">'+(correct? 'Great!':'Try')+'</span>');
  $('#scoreDisplay').after(badge);
  setTimeout(()=> badge.fadeOut(500, ()=> badge.remove()), 900);
  const floatEl = $('<div style="position:fixed; right:20px; top:20px; z-index:9999;"><img src="assets/images/anvi.png" style="width:64px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.12)"></div>');
  $('body').append(floatEl);
  setTimeout(()=> floatEl.fadeOut(700, ()=> floatEl.remove()), 900);
}

function confetti(){
  const colors = ['#60a5fa','#3b82f6','#7dd3fc','#a78bfa'];
  for(let i=0;i<80;i++){
    const el = $('<div class="confetti"></div>').css({
      left: Math.random()*100+'%',
      top: Math.random()*-10+'%',
      background: colors[Math.floor(Math.random()*colors.length)],
      transform: 'rotate('+Math.random()*360+'deg)'
    });
    $('body').append(el);
    $(el).animate({top: '110%', left: (Math.random()*100)+'%'}, 2500+Math.random()*1600, 'linear', function(){ $(this).remove(); });
  }
}

$(document).ready(()=> init());
