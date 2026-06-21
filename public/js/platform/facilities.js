(function (global) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  async function load(container, lang) {
    const host = typeof container === 'string' ? document.querySelector(container) : container;
    if (!host) return;
    try {
      const [facilities, heatmap] = await Promise.all([
        global.MRFQApi.request('/facilities'),
        global.MRFQApi.request('/facilities/heatmap')
      ]);
      host.innerHTML = `<div class="facilityPlatformGrid">${facilities.facilities.map(f => `
        <article class="facilityPlatformCard">
          <div><strong>${esc(lang === 'ar' ? f.name_ar : (f.name_en || f.name_ar))}</strong><small>${f.building_count} ${lang === 'ar' ? 'مبانٍ' : 'buildings'} · ${f.space_count} ${lang === 'ar' ? 'مساحات' : 'spaces'}</small></div>
        </article>`).join('') || `<div class="empty-state">${lang === 'ar' ? 'لا توجد مرافق' : 'No facilities'}</div>`}</div>
        <div class="heatLegend"><span data-level="normal">${lang === 'ar' ? 'طبيعي' : 'Normal'} ${heatmap.summary.normal}</span><span data-level="watch">${lang === 'ar' ? 'متابعة' : 'Watch'} ${heatmap.summary.watch}</span><span data-level="hot">${lang === 'ar' ? 'ساخن' : 'Hot'} ${heatmap.summary.hot}</span><span data-level="critical">${lang === 'ar' ? 'حرج' : 'Critical'} ${heatmap.summary.critical}</span></div>
        <div class="heatmapGrid">${heatmap.locations.map(space => `<button class="heatSpace heatSpace--${space.level}" title="${esc(space.reasons.join(', '))}"><strong>${esc(lang === 'ar' ? space.name_ar : (space.name_en || space.name_ar))}</strong><span>${space.heat_score}/100</span><small>${esc(space.building)} · ${esc(space.floor)}</small></button>`).join('')}</div>`;
    } catch (error) {
      host.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`;
    }
  }
  global.MRFQFacilities = Object.freeze({ load });
})(window);

