(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const B=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)};/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ae=globalThis,Xe=Ae.ShadowRoot&&(Ae.ShadyCSS===void 0||Ae.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ir=Symbol(),Ot=new WeakMap;let Wr=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==ir)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Xe&&e===void 0){const n=t!==void 0&&t.length===1;n&&(e=Ot.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Ot.set(t,e))}return e}toString(){return this.cssText}};const Vr=s=>new Wr(typeof s=="string"?s:s+"",void 0,ir),Kr=(s,e)=>{if(Xe)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const n=document.createElement("style"),r=Ae.litNonce;r!==void 0&&n.setAttribute("nonce",r),n.textContent=t.cssText,s.appendChild(n)}},Rt=Xe?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return Vr(t)})(s):s;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Yr,defineProperty:Qr,getOwnPropertyDescriptor:Xr,getOwnPropertyNames:Jr,getOwnPropertySymbols:es,getPrototypeOf:ts}=Object,De=globalThis,It=De.trustedTypes,rs=It?It.emptyScript:"",ss=De.reactiveElementPolyfillSupport,fe=(s,e)=>s,Ce={toAttribute(s,e){switch(e){case Boolean:s=s?rs:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},Je=(s,e)=>!Yr(s,e),Dt={attribute:!0,type:String,converter:Ce,reflect:!1,useDefault:!1,hasChanged:Je};Symbol.metadata??=Symbol("metadata"),De.litPropertyMetadata??=new WeakMap;let ie=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Dt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&Qr(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){const{get:r,set:i}=Xr(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){const o=r?.call(this);i?.call(this,a),this.requestUpdate(e,o,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Dt}static _$Ei(){if(this.hasOwnProperty(fe("elementProperties")))return;const e=ts(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(fe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(fe("properties"))){const t=this.properties,n=[...Jr(t),...es(t)];for(const r of n)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[n,r]of t)this.elementProperties.set(n,r)}this._$Eh=new Map;for(const[t,n]of this.elementProperties){const r=this._$Eu(t,n);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const r of n)t.unshift(Rt(r))}else e!==void 0&&t.push(Rt(e));return t}static _$Eu(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Kr(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&n.reflect===!0){const i=(n.converter?.toAttribute!==void 0?n.converter:Ce).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){const n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const i=n.getPropertyOptions(r),a=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Ce;this._$Em=r;const o=a.fromAttribute(t,i.type);this[r]=o??this._$Ej?.get(r)??o,this._$Em=null}}requestUpdate(e,t,n){if(e!==void 0){const r=this.constructor,i=this[e];if(n??=r.getPropertyOptions(e),!((n.hasChanged??Je)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),i!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,i]of this._$Ep)this[r]=i;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[r,i]of n){const{wrapped:a}=i,o=this[r];a!==!0||this._$AL.has(r)||o===void 0||this.C(r,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};ie.elementStyles=[],ie.shadowRootOptions={mode:"open"},ie[fe("elementProperties")]=new Map,ie[fe("finalized")]=new Map,ss?.({ReactiveElement:ie}),(De.reactiveElementVersions??=[]).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ns={attribute:!0,type:String,converter:Ce,reflect:!1,hasChanged:Je},is=(s=ns,e,t)=>{const{kind:n,metadata:r}=t;let i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),n==="setter"&&((s=Object.create(s)).wrapped=!0),i.set(t.name,s),n==="accessor"){const{name:a}=t;return{set(o){const h=e.get.call(this);e.set.call(this,o),this.requestUpdate(a,h,s)},init(o){return o!==void 0&&this.C(a,void 0,s,o),o}}}if(n==="setter"){const{name:a}=t;return function(o){const h=this[a];e.call(this,o),this.requestUpdate(a,h,s)}}throw Error("Unsupported decorator location: "+n)};function V(s){return(e,t)=>typeof t=="object"?is(s,e,t):((n,r,i)=>{const a=r.hasOwnProperty(i);return r.constructor.createProperty(i,n),a?Object.getOwnPropertyDescriptor(r,i):void 0})(s,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function as(s){return V({...s,state:!0,attribute:!1})}var Ut=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Wn(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var zt={};/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */var jt;function os(){if(jt)return zt;jt=1;var s;return function(e){(function(t){var n=typeof globalThis=="object"?globalThis:typeof Ut=="object"?Ut:typeof self=="object"?self:typeof this=="object"?this:h(),r=i(e);typeof n.Reflect<"u"&&(r=i(n.Reflect,r)),t(r,n),typeof n.Reflect>"u"&&(n.Reflect=e);function i(p,f){return function(m,k){Object.defineProperty(p,m,{configurable:!0,writable:!0,value:k}),f&&f(m,k)}}function a(){try{return Function("return this;")()}catch{}}function o(){try{return(0,eval)("(function() { return this; })()")}catch{}}function h(){return a()||o()}})(function(t,n){var r=Object.prototype.hasOwnProperty,i=typeof Symbol=="function",a=i&&typeof Symbol.toPrimitive<"u"?Symbol.toPrimitive:"@@toPrimitive",o=i&&typeof Symbol.iterator<"u"?Symbol.iterator:"@@iterator",h=typeof Object.create=="function",p={__proto__:[]}instanceof Array,f=!h&&!p,m={create:h?function(){return Fe(Object.create(null))}:p?function(){return Fe({__proto__:null})}:function(){return Fe({})},has:f?function(l,c){return r.call(l,c)}:function(l,c){return c in l},get:f?function(l,c){return r.call(l,c)?l[c]:void 0}:function(l,c){return l[c]}},k=Object.getPrototypeOf(Function),x=typeof Map=="function"&&typeof Map.prototype.entries=="function"?Map:Br(),S=typeof Set=="function"&&typeof Set.prototype.entries=="function"?Set:Fr(),M=typeof WeakMap=="function"?WeakMap:qr(),z=i?Symbol.for("@reflect-metadata:registry"):void 0,H=Lr(),K=Hr(H);function xe(l,c,u,d){if($(u)){if(!_t(l))throw new TypeError;if(!St(c))throw new TypeError;return Mr(l,c)}else{if(!_t(l))throw new TypeError;if(!D(c))throw new TypeError;if(!D(d)&&!$(d)&&!ne(d))throw new TypeError;return ne(d)&&(d=void 0),u=F(u),Or(l,c,u,d)}}t("decorate",xe);function _e(l,c){function u(d,v){if(!D(d))throw new TypeError;if(!$(v)&&!zr(v))throw new TypeError;wt(l,c,d,v)}return u}t("metadata",_e);function Le(l,c,u,d){if(!D(u))throw new TypeError;return $(d)||(d=F(d)),wt(l,c,u,d)}t("defineMetadata",Le);function ce(l,c,u){if(!D(c))throw new TypeError;return $(u)||(u=F(u)),mt(l,c,u)}t("hasMetadata",ce);function Y(l,c,u){if(!D(c))throw new TypeError;return $(u)||(u=F(u)),He(l,c,u)}t("hasOwnMetadata",Y);function Pr(l,c,u){if(!D(c))throw new TypeError;return $(u)||(u=F(u)),bt(l,c,u)}t("getMetadata",Pr);function Ar(l,c,u){if(!D(c))throw new TypeError;return $(u)||(u=F(u)),yt(l,c,u)}t("getOwnMetadata",Ar);function Tr(l,c){if(!D(l))throw new TypeError;return $(c)||(c=F(c)),kt(l,c)}t("getMetadataKeys",Tr);function Cr(l,c){if(!D(l))throw new TypeError;return $(c)||(c=F(c)),vt(l,c)}t("getOwnMetadataKeys",Cr);function Er(l,c,u){if(!D(c))throw new TypeError;if($(u)||(u=F(u)),!D(c))throw new TypeError;$(u)||(u=F(u));var d=he(c,u,!1);return $(d)?!1:d.OrdinaryDeleteMetadata(l,c,u)}t("deleteMetadata",Er);function Mr(l,c){for(var u=l.length-1;u>=0;--u){var d=l[u],v=d(c);if(!$(v)&&!ne(v)){if(!St(v))throw new TypeError;c=v}}return c}function Or(l,c,u,d){for(var v=l.length-1;v>=0;--v){var O=l[v],U=O(c,u,d);if(!$(U)&&!ne(U)){if(!D(U))throw new TypeError;d=U}}return d}function mt(l,c,u){var d=He(l,c,u);if(d)return!0;var v=Be(c);return ne(v)?!1:mt(l,v,u)}function He(l,c,u){var d=he(c,u,!1);return $(d)?!1:xt(d.OrdinaryHasOwnMetadata(l,c,u))}function bt(l,c,u){var d=He(l,c,u);if(d)return yt(l,c,u);var v=Be(c);if(!ne(v))return bt(l,v,u)}function yt(l,c,u){var d=he(c,u,!1);if(!$(d))return d.OrdinaryGetOwnMetadata(l,c,u)}function wt(l,c,u,d){var v=he(u,d,!0);v.OrdinaryDefineOwnMetadata(l,c,u,d)}function kt(l,c){var u=vt(l,c),d=Be(l);if(d===null)return u;var v=kt(d,c);if(v.length<=0)return u;if(u.length<=0)return v;for(var O=new S,U=[],_=0,g=u;_<g.length;_++){var b=g[_],y=O.has(b);y||(O.add(b),U.push(b))}for(var w=0,P=v;w<P.length;w++){var b=P[w],y=O.has(b);y||(O.add(b),U.push(b))}return U}function vt(l,c){var u=he(l,c,!1);return u?u.OrdinaryOwnMetadataKeys(l,c):[]}function $t(l){if(l===null)return 1;switch(typeof l){case"undefined":return 0;case"boolean":return 2;case"string":return 3;case"symbol":return 4;case"number":return 5;case"object":return l===null?1:6;default:return 6}}function $(l){return l===void 0}function ne(l){return l===null}function Rr(l){return typeof l=="symbol"}function D(l){return typeof l=="object"?l!==null:typeof l=="function"}function Ir(l,c){switch($t(l)){case 0:return l;case 1:return l;case 2:return l;case 3:return l;case 4:return l;case 5:return l}var u="string",d=Pt(l,a);if(d!==void 0){var v=d.call(l,u);if(D(v))throw new TypeError;return v}return Dr(l)}function Dr(l,c){var u,d,v;{var O=l.toString;if(Se(O)){var d=O.call(l);if(!D(d))return d}var u=l.valueOf;if(Se(u)){var d=u.call(l);if(!D(d))return d}}throw new TypeError}function xt(l){return!!l}function Ur(l){return""+l}function F(l){var c=Ir(l);return Rr(c)?c:Ur(c)}function _t(l){return Array.isArray?Array.isArray(l):l instanceof Object?l instanceof Array:Object.prototype.toString.call(l)==="[object Array]"}function Se(l){return typeof l=="function"}function St(l){return typeof l=="function"}function zr(l){switch($t(l)){case 3:return!0;case 4:return!0;default:return!1}}function Ne(l,c){return l===c||l!==l&&c!==c}function Pt(l,c){var u=l[c];if(u!=null){if(!Se(u))throw new TypeError;return u}}function At(l){var c=Pt(l,o);if(!Se(c))throw new TypeError;var u=c.call(l);if(!D(u))throw new TypeError;return u}function Tt(l){return l.value}function Ct(l){var c=l.next();return c.done?!1:c}function Et(l){var c=l.return;c&&c.call(l)}function Be(l){var c=Object.getPrototypeOf(l);if(typeof l!="function"||l===k||c!==k)return c;var u=l.prototype,d=u&&Object.getPrototypeOf(u);if(d==null||d===Object.prototype)return c;var v=d.constructor;return typeof v!="function"||v===l?c:v}function jr(){var l;!$(z)&&typeof n.Reflect<"u"&&!(z in n.Reflect)&&typeof n.Reflect.defineMetadata=="function"&&(l=Nr(n.Reflect));var c,u,d,v=new M,O={registerProvider:U,getProvider:g,setProvider:y};return O;function U(w){if(!Object.isExtensible(O))throw new Error("Cannot add provider to a frozen registry.");switch(!0){case l===w:break;case $(c):c=w;break;case c===w:break;case $(u):u=w;break;case u===w:break;default:d===void 0&&(d=new S),d.add(w);break}}function _(w,P){if(!$(c)){if(c.isProviderFor(w,P))return c;if(!$(u)){if(u.isProviderFor(w,P))return c;if(!$(d))for(var C=At(d);;){var R=Ct(C);if(!R)return;var N=Tt(R);if(N.isProviderFor(w,P))return Et(C),N}}}if(!$(l)&&l.isProviderFor(w,P))return l}function g(w,P){var C=v.get(w),R;return $(C)||(R=C.get(P)),$(R)&&(R=_(w,P),$(R)||($(C)&&(C=new x,v.set(w,C)),C.set(P,R))),R}function b(w){if($(w))throw new TypeError;return c===w||u===w||!$(d)&&d.has(w)}function y(w,P,C){if(!b(C))throw new Error("Metadata provider not registered.");var R=g(w,P);if(R!==C){if(!$(R))return!1;var N=v.get(w);$(N)&&(N=new x,v.set(w,N)),N.set(P,C)}return!0}}function Lr(){var l;return!$(z)&&D(n.Reflect)&&Object.isExtensible(n.Reflect)&&(l=n.Reflect[z]),$(l)&&(l=jr()),!$(z)&&D(n.Reflect)&&Object.isExtensible(n.Reflect)&&Object.defineProperty(n.Reflect,z,{enumerable:!1,configurable:!1,writable:!1,value:l}),l}function Hr(l){var c=new M,u={isProviderFor:function(b,y){var w=c.get(b);return $(w)?!1:w.has(y)},OrdinaryDefineOwnMetadata:U,OrdinaryHasOwnMetadata:v,OrdinaryGetOwnMetadata:O,OrdinaryOwnMetadataKeys:_,OrdinaryDeleteMetadata:g};return H.registerProvider(u),u;function d(b,y,w){var P=c.get(b),C=!1;if($(P)){if(!w)return;P=new x,c.set(b,P),C=!0}var R=P.get(y);if($(R)){if(!w)return;if(R=new x,P.set(y,R),!l.setProvider(b,y,u))throw P.delete(y),C&&c.delete(b),new Error("Wrong provider for target.")}return R}function v(b,y,w){var P=d(y,w,!1);return $(P)?!1:xt(P.has(b))}function O(b,y,w){var P=d(y,w,!1);if(!$(P))return P.get(b)}function U(b,y,w,P){var C=d(w,P,!0);C.set(b,y)}function _(b,y){var w=[],P=d(b,y,!1);if($(P))return w;for(var C=P.keys(),R=At(C),N=0;;){var Mt=Ct(R);if(!Mt)return w.length=N,w;var Gr=Tt(Mt);try{w[N]=Gr}catch(Zr){try{Et(R)}finally{throw Zr}}N++}}function g(b,y,w){var P=d(y,w,!1);if($(P)||!P.delete(b))return!1;if(P.size===0){var C=c.get(y);$(C)||(C.delete(w),C.size===0&&c.delete(C))}return!0}}function Nr(l){var c=l.defineMetadata,u=l.hasOwnMetadata,d=l.getOwnMetadata,v=l.getOwnMetadataKeys,O=l.deleteMetadata,U=new M,_={isProviderFor:function(g,b){var y=U.get(g);return!$(y)&&y.has(b)?!0:v(g,b).length?($(y)&&(y=new S,U.set(g,y)),y.add(b),!0):!1},OrdinaryDefineOwnMetadata:c,OrdinaryHasOwnMetadata:u,OrdinaryGetOwnMetadata:d,OrdinaryOwnMetadataKeys:v,OrdinaryDeleteMetadata:O};return _}function he(l,c,u){var d=H.getProvider(l,c);if(!$(d))return d;if(u){if(H.setProvider(l,c,K))return K;throw new Error("Illegal state.")}}function Br(){var l={},c=[],u=function(){function _(g,b,y){this._index=0,this._keys=g,this._values=b,this._selector=y}return _.prototype["@@iterator"]=function(){return this},_.prototype[o]=function(){return this},_.prototype.next=function(){var g=this._index;if(g>=0&&g<this._keys.length){var b=this._selector(this._keys[g],this._values[g]);return g+1>=this._keys.length?(this._index=-1,this._keys=c,this._values=c):this._index++,{value:b,done:!1}}return{value:void 0,done:!0}},_.prototype.throw=function(g){throw this._index>=0&&(this._index=-1,this._keys=c,this._values=c),g},_.prototype.return=function(g){return this._index>=0&&(this._index=-1,this._keys=c,this._values=c),{value:g,done:!0}},_}(),d=function(){function _(){this._keys=[],this._values=[],this._cacheKey=l,this._cacheIndex=-2}return Object.defineProperty(_.prototype,"size",{get:function(){return this._keys.length},enumerable:!0,configurable:!0}),_.prototype.has=function(g){return this._find(g,!1)>=0},_.prototype.get=function(g){var b=this._find(g,!1);return b>=0?this._values[b]:void 0},_.prototype.set=function(g,b){var y=this._find(g,!0);return this._values[y]=b,this},_.prototype.delete=function(g){var b=this._find(g,!1);if(b>=0){for(var y=this._keys.length,w=b+1;w<y;w++)this._keys[w-1]=this._keys[w],this._values[w-1]=this._values[w];return this._keys.length--,this._values.length--,Ne(g,this._cacheKey)&&(this._cacheKey=l,this._cacheIndex=-2),!0}return!1},_.prototype.clear=function(){this._keys.length=0,this._values.length=0,this._cacheKey=l,this._cacheIndex=-2},_.prototype.keys=function(){return new u(this._keys,this._values,v)},_.prototype.values=function(){return new u(this._keys,this._values,O)},_.prototype.entries=function(){return new u(this._keys,this._values,U)},_.prototype["@@iterator"]=function(){return this.entries()},_.prototype[o]=function(){return this.entries()},_.prototype._find=function(g,b){if(!Ne(this._cacheKey,g)){this._cacheIndex=-1;for(var y=0;y<this._keys.length;y++)if(Ne(this._keys[y],g)){this._cacheIndex=y;break}}return this._cacheIndex<0&&b&&(this._cacheIndex=this._keys.length,this._keys.push(g),this._values.push(void 0)),this._cacheIndex},_}();return d;function v(_,g){return _}function O(_,g){return g}function U(_,g){return[_,g]}}function Fr(){var l=function(){function c(){this._map=new x}return Object.defineProperty(c.prototype,"size",{get:function(){return this._map.size},enumerable:!0,configurable:!0}),c.prototype.has=function(u){return this._map.has(u)},c.prototype.add=function(u){return this._map.set(u,u),this},c.prototype.delete=function(u){return this._map.delete(u)},c.prototype.clear=function(){this._map.clear()},c.prototype.keys=function(){return this._map.keys()},c.prototype.values=function(){return this._map.keys()},c.prototype.entries=function(){return this._map.entries()},c.prototype["@@iterator"]=function(){return this.keys()},c.prototype[o]=function(){return this.keys()},c}();return l}function qr(){var l=16,c=m.create(),u=d();return function(){function g(){this._key=d()}return g.prototype.has=function(b){var y=v(b,!1);return y!==void 0?m.has(y,this._key):!1},g.prototype.get=function(b){var y=v(b,!1);return y!==void 0?m.get(y,this._key):void 0},g.prototype.set=function(b,y){var w=v(b,!0);return w[this._key]=y,this},g.prototype.delete=function(b){var y=v(b,!1);return y!==void 0?delete y[this._key]:!1},g.prototype.clear=function(){this._key=d()},g}();function d(){var g;do g="@@WeakMap@@"+_();while(m.has(c,g));return c[g]=!0,g}function v(g,b){if(!r.call(g,u)){if(!b)return;Object.defineProperty(g,u,{value:m.create()})}return g[u]}function O(g,b){for(var y=0;y<b;++y)g[y]=Math.random()*255|0;return g}function U(g){if(typeof Uint8Array=="function"){var b=new Uint8Array(g);return typeof crypto<"u"?crypto.getRandomValues(b):typeof msCrypto<"u"?msCrypto.getRandomValues(b):O(b,g),b}return O(new Array(g),g)}function _(){var g=U(l);g[6]=g[6]&79|64,g[8]=g[8]&191|128;for(var b="",y=0;y<l;++y){var w=g[y];(y===4||y===6||y===8)&&(b+="-"),w<16&&(b+="0"),b+=w.toString(16).toLowerCase()}return b}}function Fe(l){return l.__=void 0,delete l.__,l}})}(s||(s={})),zt}os();const ge={Singleton:0,Transient:2};class X{constructor(){this.services=new Map,this.singletonInstances=new Map,this.tokenRegistry=new Map}static getInstance(){return X.instance||(X.instance=new X),X.instance}addService(e,t,n){this.services.set(e,{token:e,implementation:t,lifetime:n}),n===ge.Singleton&&(this.singletonInstances.has(e)||this.singletonInstances.set(e,new t))}getOrCreateToken(e){const t=e.name;return this.tokenRegistry.has(t)||this.tokenRegistry.set(t,Symbol(t)),this.tokenRegistry.get(t)}getService(e){const t=this.services.get(e);if(!t)throw new Error(`Service not registered for token: ${e.toString()}`);switch(t.lifetime){case ge.Singleton:return this.getSingletonInstance(t);case ge.Transient:return new t.implementation;default:throw new Error(`Unsupported lifetime: ${t.lifetime}`)}}getSingletonInstance(e){return this.singletonInstances.has(e.token)||this.singletonInstances.set(e.token,new e.implementation),this.singletonInstances.get(e.token)}}function ls(s=ge.Singleton){return function(e){const t=X.getInstance(),n=t.getOrCreateToken(e);return t.addService(n,e,s),e}}function cs(s){return function(e,t){const n=s||Reflect.getMetadata("design:type",e,t);if(!n)throw new Error(`Cannot resolve type for property '${t}'. Make sure emitDecoratorMetadata is enabled.`);const r=X.getInstance(),i=r.getOrCreateToken(n);Object.defineProperty(e,t,{get:function(){return r.getService(i)},enumerable:!0,configurable:!0})}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const et=globalThis,Ee=et.trustedTypes,Lt=Ee?Ee.createPolicy("lit-html",{createHTML:s=>s}):void 0,ar="$lit$",W=`lit$${Math.random().toFixed(9).slice(2)}$`,or="?"+W,hs=`<${or}>`,ee=document,be=()=>ee.createComment(""),ye=s=>s===null||typeof s!="object"&&typeof s!="function",tt=Array.isArray,us=s=>tt(s)||typeof s?.[Symbol.iterator]=="function",qe=`[ 	
\f\r]`,ue=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ht=/-->/g,Nt=/>/g,Q=RegExp(`>|${qe}(?:([^\\s"'>=/]+)(${qe}*=${qe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Bt=/'/g,Ft=/"/g,lr=/^(?:script|style|textarea|title)$/i,ps=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),E=ps(1),te=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),qt=new WeakMap,J=ee.createTreeWalker(ee,129);function cr(s,e){if(!tt(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return Lt!==void 0?Lt.createHTML(e):e}const ds=(s,e)=>{const t=s.length-1,n=[];let r,i=e===2?"<svg>":e===3?"<math>":"",a=ue;for(let o=0;o<t;o++){const h=s[o];let p,f,m=-1,k=0;for(;k<h.length&&(a.lastIndex=k,f=a.exec(h),f!==null);)k=a.lastIndex,a===ue?f[1]==="!--"?a=Ht:f[1]!==void 0?a=Nt:f[2]!==void 0?(lr.test(f[2])&&(r=RegExp("</"+f[2],"g")),a=Q):f[3]!==void 0&&(a=Q):a===Q?f[0]===">"?(a=r??ue,m=-1):f[1]===void 0?m=-2:(m=a.lastIndex-f[2].length,p=f[1],a=f[3]===void 0?Q:f[3]==='"'?Ft:Bt):a===Ft||a===Bt?a=Q:a===Ht||a===Nt?a=ue:(a=Q,r=void 0);const x=a===Q&&s[o+1].startsWith("/>")?" ":"";i+=a===ue?h+hs:m>=0?(n.push(p),h.slice(0,m)+ar+h.slice(m)+W+x):h+W+(m===-2?o:x)}return[cr(s,i+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};let Ze=class hr{constructor({strings:e,_$litType$:t},n){let r;this.parts=[];let i=0,a=0;const o=e.length-1,h=this.parts,[p,f]=ds(e,t);if(this.el=hr.createElement(p,n),J.currentNode=this.el.content,t===2||t===3){const m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(r=J.nextNode())!==null&&h.length<o;){if(r.nodeType===1){if(r.hasAttributes())for(const m of r.getAttributeNames())if(m.endsWith(ar)){const k=f[a++],x=r.getAttribute(m).split(W),S=/([.?@])?(.*)/.exec(k);h.push({type:1,index:i,name:S[2],strings:x,ctor:S[1]==="."?gs:S[1]==="?"?ms:S[1]==="@"?bs:Ue}),r.removeAttribute(m)}else m.startsWith(W)&&(h.push({type:6,index:i}),r.removeAttribute(m));if(lr.test(r.tagName)){const m=r.textContent.split(W),k=m.length-1;if(k>0){r.textContent=Ee?Ee.emptyScript:"";for(let x=0;x<k;x++)r.append(m[x],be()),J.nextNode(),h.push({type:2,index:++i});r.append(m[k],be())}}}else if(r.nodeType===8)if(r.data===or)h.push({type:2,index:i});else{let m=-1;for(;(m=r.data.indexOf(W,m+1))!==-1;)h.push({type:7,index:i}),m+=W.length-1}i++}}static createElement(e,t){const n=ee.createElement("template");return n.innerHTML=e,n}};function oe(s,e,t=s,n){if(e===te)return e;let r=n!==void 0?t._$Co?.[n]:t._$Cl;const i=ye(e)?void 0:e._$litDirective$;return r?.constructor!==i&&(r?._$AO?.(!1),i===void 0?r=void 0:(r=new i(s),r._$AT(s,t,n)),n!==void 0?(t._$Co??=[])[n]=r:t._$Cl=r),r!==void 0&&(e=oe(s,r._$AS(s,e.values),r,n)),e}let fs=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??ee).importNode(t,!0);J.currentNode=r;let i=J.nextNode(),a=0,o=0,h=n[0];for(;h!==void 0;){if(a===h.index){let p;h.type===2?p=new rt(i,i.nextSibling,this,e):h.type===1?p=new h.ctor(i,h.name,h.strings,this,e):h.type===6&&(p=new ys(i,this,e)),this._$AV.push(p),h=n[++o]}a!==h?.index&&(i=J.nextNode(),a++)}return J.currentNode=ee,r}p(e){let t=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},rt=class ur{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=oe(this,e,t),ye(e)?e===I||e==null||e===""?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==te&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):us(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&ye(this._$AH)?this._$AA.nextSibling.data=e:this.T(ee.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,r=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=Ze.createElement(cr(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{const i=new fs(r,this),a=i.u(this.options);i.p(t),this.T(a),this._$AH=i}}_$AC(e){let t=qt.get(e.strings);return t===void 0&&qt.set(e.strings,t=new Ze(e)),t}k(e){tt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,r=0;for(const i of e)r===t.length?t.push(n=new ur(this.O(be()),this.O(be()),this,this.options)):n=t[r],n._$AI(i),r++;r<t.length&&(this._$AR(n&&n._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const n=e.nextSibling;e.remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Ue=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=I}_$AI(e,t=this,n,r){const i=this.strings;let a=!1;if(i===void 0)e=oe(this,e,t,0),a=!ye(e)||e!==this._$AH&&e!==te,a&&(this._$AH=e);else{const o=e;let h,p;for(e=i[0],h=0;h<i.length-1;h++)p=oe(this,o[n+h],t,h),p===te&&(p=this._$AH[h]),a||=!ye(p)||p!==this._$AH[h],p===I?e=I:e!==I&&(e+=(p??"")+i[h+1]),this._$AH[h]=p}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},gs=class extends Ue{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}},ms=class extends Ue{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}},bs=class extends Ue{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=oe(this,e,t,0)??I)===te)return;const n=this._$AH,r=e===I&&n!==I||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==I&&(n===I||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ys=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){oe(this,e)}};const ws=et.litHtmlPolyfillSupport;ws?.(Ze,rt),(et.litHtmlVersions??=[]).push("3.3.1");const ks=(s,e,t)=>{const n=t?.renderBefore??e;let r=n._$litPart$;if(r===void 0){const i=t?.renderBefore??null;n._$litPart$=r=new rt(e.insertBefore(be(),i),i,void 0,t??{})}return r._$AI(s),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const st=globalThis;let ae=class extends ie{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ks(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return te}};ae._$litElement$=!0,ae.finalized=!0,st.litElementHydrateSupport?.({LitElement:ae});const vs=st.litElementPolyfillSupport;vs?.({LitElement:ae});(st.litElementVersions??=[]).push("4.2.1");class $s{update(e){e.title&&(document.title=e.title);let t=document.querySelector('meta[name="description"]');t||(t=document.createElement("meta"),t.setAttribute("name","description"),document.head.appendChild(t)),t.setAttribute("content",e.description||"")}}const Ge=new $s;var xs=Object.defineProperty,_s=Object.getOwnPropertyDescriptor,nt=(s,e,t,n)=>{for(var r=n>1?void 0:n?_s(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=(n?a(e,t,r):a(r))||r);return n&&r&&xs(e,t,r),r};let Me=class extends ae{constructor(){super(...arguments),this.currentPath="",this.handleNavigation=()=>{const s=window.location.hash;let e=s?s.substring(1):"";e.startsWith("/")||(e="/"+e),this.currentPath=e,this.requestUpdate()}}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleNavigation),this.handleNavigation()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleNavigation)}createRenderRoot(){return this}render(){for(const[s,e]of pr.entries()){const t=new RegExp("^"+s.replace(/:[^\s/]+/g,"([\\w-]+)")+"$"),n=this.currentPath.match(t);if(n){e.metadata?Ge.update(e.metadata):Ge.update({title:"PlayableTools"});const r=n.slice(1),i=new e.component;return i.routeParams=r,this.renderContentWithLayout(()=>E`<div>${i}</div>`)}}return Ge.update({title:"Page Not Found"}),this.renderContentWithLayout(()=>E`<h1>404 Not Found</h1>`)}renderContentWithLayout(s){if(!this.defaultLayout)return s();const e=new this.defaultLayout;return e.body=s(),E`
            <div>${e}</div>
        `}};nt([V({attribute:!1})],Me.prototype,"defaultLayout",2);nt([as()],Me.prototype,"currentPath",2);Me=nt([B("router-outlet")],Me);const pr=new Map;function ke(s,e){return function(t){return pr.set(s,{component:t,metadata:e}),t}}const gt=class gt extends ae{createRenderRoot(){return this.constructor.useShadowDom?super.createRenderRoot():this}};gt.useShadowDom=!1;let L=gt;class Ss extends L{}var Ps=Object.defineProperty,As=Object.getOwnPropertyDescriptor,ve=(s,e,t,n)=>{for(var r=n>1?void 0:n?As(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=(n?a(e,t,r):a(r))||r);return n&&r&&Ps(e,t,r),r};let le=class extends L{constructor(){super(...arguments),this.open=!1,this.src="",this.alt="",this.thumbWidth="500px",this.openPopup=()=>{this.open=!0,this.requestUpdate()},this.closePopup=()=>{this.open=!1,this.requestUpdate()}}render(){return E`
      <img
        src="${this.src}"
        alt="${this.alt}"
        style="max-width: ${this.thumbWidth}; display: block; margin: 1em auto; border: 1px solid #ccc; border-radius: 8px; cursor: zoom-in;"
        @click=${this.openPopup}
      />
      ${this.open?E`
        <div
          style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;"
          @click=${this.closePopup}
        >
          <img
            src="${this.src}"
            alt="${this.alt} full size"
            style="max-width:90vw;max-height:90vh;box-shadow:0 0 32px #000;border-radius:12px;"
            @click=${s=>s.stopPropagation()}
          />
          <button
            style="position:absolute;top:32px;right:48px;font-size:2rem;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:48px;height:48px;cursor:pointer;"
            @click=${this.closePopup}
            aria-label="Close preview"
          >×</button>
        </div>
      `:""}
    `}};ve([V({type:Boolean})],le.prototype,"open",2);ve([V({type:String})],le.prototype,"src",2);ve([V({type:String})],le.prototype,"alt",2);ve([V({type:String})],le.prototype,"thumbWidth",2);le=ve([B("image-popup")],le);var Ts=Object.getOwnPropertyDescriptor,Cs=(s,e,t,n)=>{for(var r=n>1?void 0:n?Ts(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Gt=class extends L{render(){return E`
      <div class="compress-assets-info">
        <h1>Compress Assets</h1>
        <p>
          <strong>PngChpocker</strong> is a Windows desktop app that allows you
          to compress PNG images in a folder without needing to use online
          services like TinyPNG. Additionally, it can extract images from merged
          HTML files containing base64-encoded images.
        </p>
        <image-popup src="PngChpocker.png" alt="PngChpocker app screenshot" thumbWidth="500px"></image-popup>
        <div
          class="usage-tip"
          style="background:#f8f8f8; border-left:4px solid #2196f3; padding:1em; margin:1em 0;"
        >
          <strong>Usage tip:</strong> Just open the app, choose the maximum
          number of colors for the image (256 is usually fine, but you can
          experiment to keep acceptable quality). For images with gradients,
          it's better to use more colors. Then select and drag images from
          Explorer to the app window and see the result. It will create a subfolder with compressed images.
        </div>
        <p>
          <a href="files/PngChpocker.zip" download>Download PngChpocker x64 for windows</a>
        </p>
        <p>
          <em
            >Note: A new version of this tool will soon be integrated directly
            into the Playable Tools site.</em
          >
        </p>
      </div>
    `}};Gt=Cs([B("compress-assets-page"),ke("/compress-assets")],Gt);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Es={CHILD:2},Ms=s=>(...e)=>({_$litDirective$:s,values:e});class Os{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class We extends Os{constructor(e){if(super(e),this.it=I,e.type!==Es.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===I||e==null)return this._t=void 0,this.it=e;if(e===te)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}We.directiveName="unsafeHTML",We.resultType=1;const Rs=Ms(We);function it(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var se=it();function dr(s){se=s}var me={exec:()=>null};function A(s,e=""){let t=typeof s=="string"?s:s.source,n={replace:(r,i)=>{let a=typeof i=="string"?i:i.source;return a=a.replace(j.caret,"$1"),t=t.replace(r,a),n},getRegex:()=>new RegExp(t,e)};return n}var j={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:s=>new RegExp(`^( {0,3}${s})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}#`),htmlBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}<(?:[a-z].*>|!--)`,"i")},Is=/^(?:[ \t]*(?:\n|$))+/,Ds=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Us=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,$e=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,zs=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,at=/(?:[*+-]|\d{1,9}[.)])/,fr=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,gr=A(fr).replace(/bull/g,at).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),js=A(fr).replace(/bull/g,at).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),ot=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Ls=/^[^\n]+/,lt=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Hs=A(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",lt).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Ns=A(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,at).getRegex(),ze="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",ct=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Bs=A("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",ct).replace("tag",ze).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),mr=A(ot).replace("hr",$e).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ze).getRegex(),Fs=A(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",mr).getRegex(),ht={blockquote:Fs,code:Ds,def:Hs,fences:Us,heading:zs,hr:$e,html:Bs,lheading:gr,list:Ns,newline:Is,paragraph:mr,table:me,text:Ls},Zt=A("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",$e).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ze).getRegex(),qs={...ht,lheading:js,table:Zt,paragraph:A(ot).replace("hr",$e).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Zt).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ze).getRegex()},Gs={...ht,html:A(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",ct).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:me,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:A(ot).replace("hr",$e).replace("heading",` *#{1,6} *[^
]`).replace("lheading",gr).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Zs=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Ws=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,br=/^( {2,}|\\)\n(?!\s*$)/,Vs=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,je=/[\p{P}\p{S}]/u,ut=/[\s\p{P}\p{S}]/u,yr=/[^\s\p{P}\p{S}]/u,Ks=A(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,ut).getRegex(),wr=/(?!~)[\p{P}\p{S}]/u,Ys=/(?!~)[\s\p{P}\p{S}]/u,Qs=/(?:[^\s\p{P}\p{S}]|~)/u,Xs=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,kr=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,Js=A(kr,"u").replace(/punct/g,je).getRegex(),en=A(kr,"u").replace(/punct/g,wr).getRegex(),vr="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",tn=A(vr,"gu").replace(/notPunctSpace/g,yr).replace(/punctSpace/g,ut).replace(/punct/g,je).getRegex(),rn=A(vr,"gu").replace(/notPunctSpace/g,Qs).replace(/punctSpace/g,Ys).replace(/punct/g,wr).getRegex(),sn=A("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,yr).replace(/punctSpace/g,ut).replace(/punct/g,je).getRegex(),nn=A(/\\(punct)/,"gu").replace(/punct/g,je).getRegex(),an=A(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),on=A(ct).replace("(?:-->|$)","-->").getRegex(),ln=A("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",on).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Oe=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,cn=A(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",Oe).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),$r=A(/^!?\[(label)\]\[(ref)\]/).replace("label",Oe).replace("ref",lt).getRegex(),xr=A(/^!?\[(ref)\](?:\[\])?/).replace("ref",lt).getRegex(),hn=A("reflink|nolink(?!\\()","g").replace("reflink",$r).replace("nolink",xr).getRegex(),pt={_backpedal:me,anyPunctuation:nn,autolink:an,blockSkip:Xs,br,code:Ws,del:me,emStrongLDelim:Js,emStrongRDelimAst:tn,emStrongRDelimUnd:sn,escape:Zs,link:cn,nolink:xr,punctuation:Ks,reflink:$r,reflinkSearch:hn,tag:ln,text:Vs,url:me},un={...pt,link:A(/^!?\[(label)\]\((.*?)\)/).replace("label",Oe).getRegex(),reflink:A(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Oe).getRegex()},Ve={...pt,emStrongRDelimAst:rn,emStrongLDelim:en,url:A(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},pn={...Ve,br:A(br).replace("{2,}","*").getRegex(),text:A(Ve.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Pe={normal:ht,gfm:qs,pedantic:Gs},pe={normal:pt,gfm:Ve,breaks:pn,pedantic:un},dn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Wt=s=>dn[s];function q(s,e){if(e){if(j.escapeTest.test(s))return s.replace(j.escapeReplace,Wt)}else if(j.escapeTestNoEncode.test(s))return s.replace(j.escapeReplaceNoEncode,Wt);return s}function Vt(s){try{s=encodeURI(s).replace(j.percentDecode,"%")}catch{return null}return s}function Kt(s,e){let t=s.replace(j.findPipe,(i,a,o)=>{let h=!1,p=a;for(;--p>=0&&o[p]==="\\";)h=!h;return h?"|":" |"}),n=t.split(j.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;r<n.length;r++)n[r]=n[r].trim().replace(j.slashPipe,"|");return n}function de(s,e,t){let n=s.length;if(n===0)return"";let r=0;for(;r<n&&s.charAt(n-r-1)===e;)r++;return s.slice(0,n-r)}function fn(s,e){if(s.indexOf(e[1])===-1)return-1;let t=0;for(let n=0;n<s.length;n++)if(s[n]==="\\")n++;else if(s[n]===e[0])t++;else if(s[n]===e[1]&&(t--,t<0))return n;return t>0?-2:-1}function Yt(s,e,t,n,r){let i=e.href,a=e.title||null,o=s[1].replace(r.other.outputLinkReplace,"$1");n.state.inLink=!0;let h={type:s[0].charAt(0)==="!"?"image":"link",raw:t,href:i,title:a,text:o,tokens:n.inlineTokens(o)};return n.state.inLink=!1,h}function gn(s,e,t){let n=s.match(t.other.indentCodeCompensation);if(n===null)return e;let r=n[1];return e.split(`
`).map(i=>{let a=i.match(t.other.beginningSpace);if(a===null)return i;let[o]=a;return o.length>=r.length?i.slice(r.length):i}).join(`
`)}var Re=class{options;rules;lexer;constructor(s){this.options=s||se}space(s){let e=this.rules.block.newline.exec(s);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(s){let e=this.rules.block.code.exec(s);if(e){let t=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?t:de(t,`
`)}}}fences(s){let e=this.rules.block.fences.exec(s);if(e){let t=e[0],n=gn(t,e[3]||"",this.rules);return{type:"code",raw:t,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:n}}}heading(s){let e=this.rules.block.heading.exec(s);if(e){let t=e[2].trim();if(this.rules.other.endingHash.test(t)){let n=de(t,"#");(this.options.pedantic||!n||this.rules.other.endingSpaceChar.test(n))&&(t=n.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(s){let e=this.rules.block.hr.exec(s);if(e)return{type:"hr",raw:de(e[0],`
`)}}blockquote(s){let e=this.rules.block.blockquote.exec(s);if(e){let t=de(e[0],`
`).split(`
`),n="",r="",i=[];for(;t.length>0;){let a=!1,o=[],h;for(h=0;h<t.length;h++)if(this.rules.other.blockquoteStart.test(t[h]))o.push(t[h]),a=!0;else if(!a)o.push(t[h]);else break;t=t.slice(h);let p=o.join(`
`),f=p.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");n=n?`${n}
${p}`:p,r=r?`${r}
${f}`:f;let m=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(f,i,!0),this.lexer.state.top=m,t.length===0)break;let k=i.at(-1);if(k?.type==="code")break;if(k?.type==="blockquote"){let x=k,S=x.raw+`
`+t.join(`
`),M=this.blockquote(S);i[i.length-1]=M,n=n.substring(0,n.length-x.raw.length)+M.raw,r=r.substring(0,r.length-x.text.length)+M.text;break}else if(k?.type==="list"){let x=k,S=x.raw+`
`+t.join(`
`),M=this.list(S);i[i.length-1]=M,n=n.substring(0,n.length-k.raw.length)+M.raw,r=r.substring(0,r.length-x.raw.length)+M.raw,t=S.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:n,tokens:i,text:r}}}list(s){let e=this.rules.block.list.exec(s);if(e){let t=e[1].trim(),n=t.length>1,r={type:"list",raw:"",ordered:n,start:n?+t.slice(0,-1):"",loose:!1,items:[]};t=n?`\\d{1,9}\\${t.slice(-1)}`:`\\${t}`,this.options.pedantic&&(t=n?t:"[*+-]");let i=this.rules.other.listItemRegex(t),a=!1;for(;s;){let h=!1,p="",f="";if(!(e=i.exec(s))||this.rules.block.hr.test(s))break;p=e[0],s=s.substring(p.length);let m=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,H=>" ".repeat(3*H.length)),k=s.split(`
`,1)[0],x=!m.trim(),S=0;if(this.options.pedantic?(S=2,f=m.trimStart()):x?S=e[1].length+1:(S=e[2].search(this.rules.other.nonSpaceChar),S=S>4?1:S,f=m.slice(S),S+=e[1].length),x&&this.rules.other.blankLine.test(k)&&(p+=k+`
`,s=s.substring(k.length+1),h=!0),!h){let H=this.rules.other.nextBulletRegex(S),K=this.rules.other.hrRegex(S),xe=this.rules.other.fencesBeginRegex(S),_e=this.rules.other.headingBeginRegex(S),Le=this.rules.other.htmlBeginRegex(S);for(;s;){let ce=s.split(`
`,1)[0],Y;if(k=ce,this.options.pedantic?(k=k.replace(this.rules.other.listReplaceNesting,"  "),Y=k):Y=k.replace(this.rules.other.tabCharGlobal,"    "),xe.test(k)||_e.test(k)||Le.test(k)||H.test(k)||K.test(k))break;if(Y.search(this.rules.other.nonSpaceChar)>=S||!k.trim())f+=`
`+Y.slice(S);else{if(x||m.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||xe.test(m)||_e.test(m)||K.test(m))break;f+=`
`+k}!x&&!k.trim()&&(x=!0),p+=ce+`
`,s=s.substring(ce.length+1),m=Y.slice(S)}}r.loose||(a?r.loose=!0:this.rules.other.doubleBlankLine.test(p)&&(a=!0));let M=null,z;this.options.gfm&&(M=this.rules.other.listIsTask.exec(f),M&&(z=M[0]!=="[ ] ",f=f.replace(this.rules.other.listReplaceTask,""))),r.items.push({type:"list_item",raw:p,task:!!M,checked:z,loose:!1,text:f,tokens:[]}),r.raw+=p}let o=r.items.at(-1);if(o)o.raw=o.raw.trimEnd(),o.text=o.text.trimEnd();else return;r.raw=r.raw.trimEnd();for(let h=0;h<r.items.length;h++)if(this.lexer.state.top=!1,r.items[h].tokens=this.lexer.blockTokens(r.items[h].text,[]),!r.loose){let p=r.items[h].tokens.filter(m=>m.type==="space"),f=p.length>0&&p.some(m=>this.rules.other.anyLine.test(m.raw));r.loose=f}if(r.loose)for(let h=0;h<r.items.length;h++)r.items[h].loose=!0;return r}}html(s){let e=this.rules.block.html.exec(s);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(s){let e=this.rules.block.def.exec(s);if(e){let t=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),n=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",r=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:t,raw:e[0],href:n,title:r}}}table(s){let e=this.rules.block.table.exec(s);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let t=Kt(e[1]),n=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),r=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],i={type:"table",raw:e[0],header:[],align:[],rows:[]};if(t.length===n.length){for(let a of n)this.rules.other.tableAlignRight.test(a)?i.align.push("right"):this.rules.other.tableAlignCenter.test(a)?i.align.push("center"):this.rules.other.tableAlignLeft.test(a)?i.align.push("left"):i.align.push(null);for(let a=0;a<t.length;a++)i.header.push({text:t[a],tokens:this.lexer.inline(t[a]),header:!0,align:i.align[a]});for(let a of r)i.rows.push(Kt(a,i.header.length).map((o,h)=>({text:o,tokens:this.lexer.inline(o),header:!1,align:i.align[h]})));return i}}lheading(s){let e=this.rules.block.lheading.exec(s);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(s){let e=this.rules.block.paragraph.exec(s);if(e){let t=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}}}text(s){let e=this.rules.block.text.exec(s);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(s){let e=this.rules.inline.escape.exec(s);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(s){let e=this.rules.inline.tag.exec(s);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(s){let e=this.rules.inline.link.exec(s);if(e){let t=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(t)){if(!this.rules.other.endAngleBracket.test(t))return;let i=de(t.slice(0,-1),"\\");if((t.length-i.length)%2===0)return}else{let i=fn(e[2],"()");if(i===-2)return;if(i>-1){let a=(e[0].indexOf("!")===0?5:4)+e[1].length+i;e[2]=e[2].substring(0,i),e[0]=e[0].substring(0,a).trim(),e[3]=""}}let n=e[2],r="";if(this.options.pedantic){let i=this.rules.other.pedanticHrefTitle.exec(n);i&&(n=i[1],r=i[3])}else r=e[3]?e[3].slice(1,-1):"";return n=n.trim(),this.rules.other.startAngleBracket.test(n)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(t)?n=n.slice(1):n=n.slice(1,-1)),Yt(e,{href:n&&n.replace(this.rules.inline.anyPunctuation,"$1"),title:r&&r.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(s,e){let t;if((t=this.rules.inline.reflink.exec(s))||(t=this.rules.inline.nolink.exec(s))){let n=(t[2]||t[1]).replace(this.rules.other.multipleSpaceGlobal," "),r=e[n.toLowerCase()];if(!r){let i=t[0].charAt(0);return{type:"text",raw:i,text:i}}return Yt(t,r,t[0],this.lexer,this.rules)}}emStrong(s,e,t=""){let n=this.rules.inline.emStrongLDelim.exec(s);if(!(!n||n[3]&&t.match(this.rules.other.unicodeAlphaNumeric))&&(!(n[1]||n[2])||!t||this.rules.inline.punctuation.exec(t))){let r=[...n[0]].length-1,i,a,o=r,h=0,p=n[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(p.lastIndex=0,e=e.slice(-1*s.length+r);(n=p.exec(e))!=null;){if(i=n[1]||n[2]||n[3]||n[4]||n[5]||n[6],!i)continue;if(a=[...i].length,n[3]||n[4]){o+=a;continue}else if((n[5]||n[6])&&r%3&&!((r+a)%3)){h+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o+h);let f=[...n[0]][0].length,m=s.slice(0,r+n.index+f+a);if(Math.min(r,a)%2){let x=m.slice(1,-1);return{type:"em",raw:m,text:x,tokens:this.lexer.inlineTokens(x)}}let k=m.slice(2,-2);return{type:"strong",raw:m,text:k,tokens:this.lexer.inlineTokens(k)}}}}codespan(s){let e=this.rules.inline.code.exec(s);if(e){let t=e[2].replace(this.rules.other.newLineCharGlobal," "),n=this.rules.other.nonSpaceChar.test(t),r=this.rules.other.startingSpaceChar.test(t)&&this.rules.other.endingSpaceChar.test(t);return n&&r&&(t=t.substring(1,t.length-1)),{type:"codespan",raw:e[0],text:t}}}br(s){let e=this.rules.inline.br.exec(s);if(e)return{type:"br",raw:e[0]}}del(s){let e=this.rules.inline.del.exec(s);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(s){let e=this.rules.inline.autolink.exec(s);if(e){let t,n;return e[2]==="@"?(t=e[1],n="mailto:"+t):(t=e[1],n=t),{type:"link",raw:e[0],text:t,href:n,tokens:[{type:"text",raw:t,text:t}]}}}url(s){let e;if(e=this.rules.inline.url.exec(s)){let t,n;if(e[2]==="@")t=e[0],n="mailto:"+t;else{let r;do r=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(r!==e[0]);t=e[0],e[1]==="www."?n="http://"+e[0]:n=e[0]}return{type:"link",raw:e[0],text:t,href:n,tokens:[{type:"text",raw:t,text:t}]}}}inlineText(s){let e=this.rules.inline.text.exec(s);if(e){let t=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:t}}}},G=class Ke{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||se,this.options.tokenizer=this.options.tokenizer||new Re,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:j,block:Pe.normal,inline:pe.normal};this.options.pedantic?(t.block=Pe.pedantic,t.inline=pe.pedantic):this.options.gfm&&(t.block=Pe.gfm,this.options.breaks?t.inline=pe.breaks:t.inline=pe.gfm),this.tokenizer.rules=t}static get rules(){return{block:Pe,inline:pe}}static lex(e,t){return new Ke(t).lex(e)}static lexInline(e,t){return new Ke(t).inlineTokens(e)}lex(e){e=e.replace(j.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let n=this.inlineQueue[t];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){for(this.options.pedantic&&(e=e.replace(j.tabCharGlobal,"    ").replace(j.spaceLine,""));e;){let r;if(this.options.extensions?.block?.some(a=>(r=a.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let a=t.at(-1);r.raw.length===1&&a!==void 0?a.raw+=`
`:t.push(r);continue}if(r=this.tokenizer.code(e)){e=e.substring(r.raw.length);let a=t.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+r.raw,a.text+=`
`+r.text,this.inlineQueue.at(-1).src=a.text):t.push(r);continue}if(r=this.tokenizer.fences(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.heading(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.hr(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.blockquote(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.list(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.html(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(e)){e=e.substring(r.raw.length);let a=t.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+r.raw,a.text+=`
`+r.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title});continue}if(r=this.tokenizer.table(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.lheading(e)){e=e.substring(r.raw.length),t.push(r);continue}let i=e;if(this.options.extensions?.startBlock){let a=1/0,o=e.slice(1),h;this.options.extensions.startBlock.forEach(p=>{h=p.call({lexer:this},o),typeof h=="number"&&h>=0&&(a=Math.min(a,h))}),a<1/0&&a>=0&&(i=e.substring(0,a+1))}if(this.state.top&&(r=this.tokenizer.paragraph(i))){let a=t.at(-1);n&&a?.type==="paragraph"?(a.raw+=`
`+r.raw,a.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):t.push(r),n=i.length!==e.length,e=e.substring(r.raw.length);continue}if(r=this.tokenizer.text(e)){e=e.substring(r.raw.length);let a=t.at(-1);a?.type==="text"?(a.raw+=`
`+r.raw,a.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):t.push(r);continue}if(e){let a="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(a);break}else throw new Error(a)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n=e,r=null;if(this.tokens.links){let o=Object.keys(this.tokens.links);if(o.length>0)for(;(r=this.tokenizer.rules.inline.reflinkSearch.exec(n))!=null;)o.includes(r[0].slice(r[0].lastIndexOf("[")+1,-1))&&(n=n.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(r=this.tokenizer.rules.inline.anyPunctuation.exec(n))!=null;)n=n.slice(0,r.index)+"++"+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(r=this.tokenizer.rules.inline.blockSkip.exec(n))!=null;)n=n.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let i=!1,a="";for(;e;){i||(a=""),i=!1;let o;if(this.options.extensions?.inline?.some(p=>(o=p.call({lexer:this},e,t))?(e=e.substring(o.raw.length),t.push(o),!0):!1))continue;if(o=this.tokenizer.escape(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.tag(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.link(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let p=t.at(-1);o.type==="text"&&p?.type==="text"?(p.raw+=o.raw,p.text+=o.text):t.push(o);continue}if(o=this.tokenizer.emStrong(e,n,a)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.codespan(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.br(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.del(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.autolink(e)){e=e.substring(o.raw.length),t.push(o);continue}if(!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),t.push(o);continue}let h=e;if(this.options.extensions?.startInline){let p=1/0,f=e.slice(1),m;this.options.extensions.startInline.forEach(k=>{m=k.call({lexer:this},f),typeof m=="number"&&m>=0&&(p=Math.min(p,m))}),p<1/0&&p>=0&&(h=e.substring(0,p+1))}if(o=this.tokenizer.inlineText(h)){e=e.substring(o.raw.length),o.raw.slice(-1)!=="_"&&(a=o.raw.slice(-1)),i=!0;let p=t.at(-1);p?.type==="text"?(p.raw+=o.raw,p.text+=o.text):t.push(o);continue}if(e){let p="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(p);break}else throw new Error(p)}}return t}},Ie=class{options;parser;constructor(s){this.options=s||se}space(s){return""}code({text:s,lang:e,escaped:t}){let n=(e||"").match(j.notSpaceStart)?.[0],r=s.replace(j.endingNewline,"")+`
`;return n?'<pre><code class="language-'+q(n)+'">'+(t?r:q(r,!0))+`</code></pre>
`:"<pre><code>"+(t?r:q(r,!0))+`</code></pre>
`}blockquote({tokens:s}){return`<blockquote>
${this.parser.parse(s)}</blockquote>
`}html({text:s}){return s}heading({tokens:s,depth:e}){return`<h${e}>${this.parser.parseInline(s)}</h${e}>
`}hr(s){return`<hr>
`}list(s){let e=s.ordered,t=s.start,n="";for(let a=0;a<s.items.length;a++){let o=s.items[a];n+=this.listitem(o)}let r=e?"ol":"ul",i=e&&t!==1?' start="'+t+'"':"";return"<"+r+i+`>
`+n+"</"+r+`>
`}listitem(s){let e="";if(s.task){let t=this.checkbox({checked:!!s.checked});s.loose?s.tokens[0]?.type==="paragraph"?(s.tokens[0].text=t+" "+s.tokens[0].text,s.tokens[0].tokens&&s.tokens[0].tokens.length>0&&s.tokens[0].tokens[0].type==="text"&&(s.tokens[0].tokens[0].text=t+" "+q(s.tokens[0].tokens[0].text),s.tokens[0].tokens[0].escaped=!0)):s.tokens.unshift({type:"text",raw:t+" ",text:t+" ",escaped:!0}):e+=t+" "}return e+=this.parser.parse(s.tokens,!!s.loose),`<li>${e}</li>
`}checkbox({checked:s}){return"<input "+(s?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:s}){return`<p>${this.parser.parseInline(s)}</p>
`}table(s){let e="",t="";for(let r=0;r<s.header.length;r++)t+=this.tablecell(s.header[r]);e+=this.tablerow({text:t});let n="";for(let r=0;r<s.rows.length;r++){let i=s.rows[r];t="";for(let a=0;a<i.length;a++)t+=this.tablecell(i[a]);n+=this.tablerow({text:t})}return n&&(n=`<tbody>${n}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+n+`</table>
`}tablerow({text:s}){return`<tr>
${s}</tr>
`}tablecell(s){let e=this.parser.parseInline(s.tokens),t=s.header?"th":"td";return(s.align?`<${t} align="${s.align}">`:`<${t}>`)+e+`</${t}>
`}strong({tokens:s}){return`<strong>${this.parser.parseInline(s)}</strong>`}em({tokens:s}){return`<em>${this.parser.parseInline(s)}</em>`}codespan({text:s}){return`<code>${q(s,!0)}</code>`}br(s){return"<br>"}del({tokens:s}){return`<del>${this.parser.parseInline(s)}</del>`}link({href:s,title:e,tokens:t}){let n=this.parser.parseInline(t),r=Vt(s);if(r===null)return n;s=r;let i='<a href="'+s+'"';return e&&(i+=' title="'+q(e)+'"'),i+=">"+n+"</a>",i}image({href:s,title:e,text:t,tokens:n}){n&&(t=this.parser.parseInline(n,this.parser.textRenderer));let r=Vt(s);if(r===null)return q(t);s=r;let i=`<img src="${s}" alt="${t}"`;return e&&(i+=` title="${q(e)}"`),i+=">",i}text(s){return"tokens"in s&&s.tokens?this.parser.parseInline(s.tokens):"escaped"in s&&s.escaped?s.text:q(s.text)}},dt=class{strong({text:s}){return s}em({text:s}){return s}codespan({text:s}){return s}del({text:s}){return s}html({text:s}){return s}text({text:s}){return s}link({text:s}){return""+s}image({text:s}){return""+s}br(){return""}},Z=class Ye{options;renderer;textRenderer;constructor(e){this.options=e||se,this.options.renderer=this.options.renderer||new Ie,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new dt}static parse(e,t){return new Ye(t).parse(e)}static parseInline(e,t){return new Ye(t).parseInline(e)}parse(e,t=!0){let n="";for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let o=i,h=this.options.extensions.renderers[o.type].call({parser:this},o);if(h!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(o.type)){n+=h||"";continue}}let a=i;switch(a.type){case"space":{n+=this.renderer.space(a);continue}case"hr":{n+=this.renderer.hr(a);continue}case"heading":{n+=this.renderer.heading(a);continue}case"code":{n+=this.renderer.code(a);continue}case"table":{n+=this.renderer.table(a);continue}case"blockquote":{n+=this.renderer.blockquote(a);continue}case"list":{n+=this.renderer.list(a);continue}case"html":{n+=this.renderer.html(a);continue}case"paragraph":{n+=this.renderer.paragraph(a);continue}case"text":{let o=a,h=this.renderer.text(o);for(;r+1<e.length&&e[r+1].type==="text";)o=e[++r],h+=`
`+this.renderer.text(o);t?n+=this.renderer.paragraph({type:"paragraph",raw:h,text:h,tokens:[{type:"text",raw:h,text:h,escaped:!0}]}):n+=h;continue}default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return n}parseInline(e,t=this.renderer){let n="";for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let o=this.options.extensions.renderers[i.type].call({parser:this},i);if(o!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){n+=o||"";continue}}let a=i;switch(a.type){case"escape":{n+=t.text(a);break}case"html":{n+=t.html(a);break}case"link":{n+=t.link(a);break}case"image":{n+=t.image(a);break}case"strong":{n+=t.strong(a);break}case"em":{n+=t.em(a);break}case"codespan":{n+=t.codespan(a);break}case"br":{n+=t.br(a);break}case"del":{n+=t.del(a);break}case"text":{n+=t.text(a);break}default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return n}},Te=class{options;block;constructor(s){this.options=s||se}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(s){return s}postprocess(s){return s}processAllTokens(s){return s}provideLexer(){return this.block?G.lex:G.lexInline}provideParser(){return this.block?Z.parse:Z.parseInline}},mn=class{defaults=it();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=Z;Renderer=Ie;TextRenderer=dt;Lexer=G;Tokenizer=Re;Hooks=Te;constructor(...s){this.use(...s)}walkTokens(s,e){let t=[];for(let n of s)switch(t=t.concat(e.call(this,n)),n.type){case"table":{let r=n;for(let i of r.header)t=t.concat(this.walkTokens(i.tokens,e));for(let i of r.rows)for(let a of i)t=t.concat(this.walkTokens(a.tokens,e));break}case"list":{let r=n;t=t.concat(this.walkTokens(r.items,e));break}default:{let r=n;this.defaults.extensions?.childTokens?.[r.type]?this.defaults.extensions.childTokens[r.type].forEach(i=>{let a=r[i].flat(1/0);t=t.concat(this.walkTokens(a,e))}):r.tokens&&(t=t.concat(this.walkTokens(r.tokens,e)))}}return t}use(...s){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return s.forEach(t=>{let n={...t};if(n.async=this.defaults.async||n.async||!1,t.extensions&&(t.extensions.forEach(r=>{if(!r.name)throw new Error("extension name required");if("renderer"in r){let i=e.renderers[r.name];i?e.renderers[r.name]=function(...a){let o=r.renderer.apply(this,a);return o===!1&&(o=i.apply(this,a)),o}:e.renderers[r.name]=r.renderer}if("tokenizer"in r){if(!r.level||r.level!=="block"&&r.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let i=e[r.level];i?i.unshift(r.tokenizer):e[r.level]=[r.tokenizer],r.start&&(r.level==="block"?e.startBlock?e.startBlock.push(r.start):e.startBlock=[r.start]:r.level==="inline"&&(e.startInline?e.startInline.push(r.start):e.startInline=[r.start]))}"childTokens"in r&&r.childTokens&&(e.childTokens[r.name]=r.childTokens)}),n.extensions=e),t.renderer){let r=this.defaults.renderer||new Ie(this.defaults);for(let i in t.renderer){if(!(i in r))throw new Error(`renderer '${i}' does not exist`);if(["options","parser"].includes(i))continue;let a=i,o=t.renderer[a],h=r[a];r[a]=(...p)=>{let f=o.apply(r,p);return f===!1&&(f=h.apply(r,p)),f||""}}n.renderer=r}if(t.tokenizer){let r=this.defaults.tokenizer||new Re(this.defaults);for(let i in t.tokenizer){if(!(i in r))throw new Error(`tokenizer '${i}' does not exist`);if(["options","rules","lexer"].includes(i))continue;let a=i,o=t.tokenizer[a],h=r[a];r[a]=(...p)=>{let f=o.apply(r,p);return f===!1&&(f=h.apply(r,p)),f}}n.tokenizer=r}if(t.hooks){let r=this.defaults.hooks||new Te;for(let i in t.hooks){if(!(i in r))throw new Error(`hook '${i}' does not exist`);if(["options","block"].includes(i))continue;let a=i,o=t.hooks[a],h=r[a];Te.passThroughHooks.has(i)?r[a]=p=>{if(this.defaults.async)return Promise.resolve(o.call(r,p)).then(m=>h.call(r,m));let f=o.call(r,p);return h.call(r,f)}:r[a]=(...p)=>{let f=o.apply(r,p);return f===!1&&(f=h.apply(r,p)),f}}n.hooks=r}if(t.walkTokens){let r=this.defaults.walkTokens,i=t.walkTokens;n.walkTokens=function(a){let o=[];return o.push(i.call(this,a)),r&&(o=o.concat(r.call(this,a))),o}}this.defaults={...this.defaults,...n}}),this}setOptions(s){return this.defaults={...this.defaults,...s},this}lexer(s,e){return G.lex(s,e??this.defaults)}parser(s,e){return Z.parse(s,e??this.defaults)}parseMarkdown(s){return(e,t)=>{let n={...t},r={...this.defaults,...n},i=this.onError(!!r.silent,!!r.async);if(this.defaults.async===!0&&n.async===!1)return i(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return i(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return i(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));r.hooks&&(r.hooks.options=r,r.hooks.block=s);let a=r.hooks?r.hooks.provideLexer():s?G.lex:G.lexInline,o=r.hooks?r.hooks.provideParser():s?Z.parse:Z.parseInline;if(r.async)return Promise.resolve(r.hooks?r.hooks.preprocess(e):e).then(h=>a(h,r)).then(h=>r.hooks?r.hooks.processAllTokens(h):h).then(h=>r.walkTokens?Promise.all(this.walkTokens(h,r.walkTokens)).then(()=>h):h).then(h=>o(h,r)).then(h=>r.hooks?r.hooks.postprocess(h):h).catch(i);try{r.hooks&&(e=r.hooks.preprocess(e));let h=a(e,r);r.hooks&&(h=r.hooks.processAllTokens(h)),r.walkTokens&&this.walkTokens(h,r.walkTokens);let p=o(h,r);return r.hooks&&(p=r.hooks.postprocess(p)),p}catch(h){return i(h)}}}onError(s,e){return t=>{if(t.message+=`
Please report this to https://github.com/markedjs/marked.`,s){let n="<p>An error occurred:</p><pre>"+q(t.message+"",!0)+"</pre>";return e?Promise.resolve(n):n}if(e)return Promise.reject(t);throw t}}},re=new mn;function T(s,e){return re.parse(s,e)}T.options=T.setOptions=function(s){return re.setOptions(s),T.defaults=re.defaults,dr(T.defaults),T};T.getDefaults=it;T.defaults=se;T.use=function(...s){return re.use(...s),T.defaults=re.defaults,dr(T.defaults),T};T.walkTokens=function(s,e){return re.walkTokens(s,e)};T.parseInline=re.parseInline;T.Parser=Z;T.parser=Z.parse;T.Renderer=Ie;T.TextRenderer=dt;T.Lexer=G;T.lexer=G.lex;T.Tokenizer=Re;T.Hooks=Te;T.parse=T;T.options;T.setOptions;T.use;T.walkTokens;T.parseInline;Z.parse;G.lex;const bn=`## Unifying Playable Ads: The CTA SDK Bridge\r
\r
> **Note:** The CTA SDK is used by the [Publish Tool](/#publish), enabling seamless deployment and integration of HTML5 playables across multiple ad networks.  \r
\r
In the world of HTML5 playable ads, a significant challenge for developers is adapting their creative to run on various ad networks like ironSource, Unity Ads, or Google Ads. Each network has its own specific API (SDK) for handling crucial events like opening the app store, tracking user interaction, or managing sound. Writing separate code for each platform is inefficient and increases development time.\r
\r
The code snippet you provided demonstrates an elegant solution to this problem: a unified "Call to Action" (CTA) bridge. This approach uses a single, generic \`document.CTA\` object to interface with the specific SDK of the ad network where the playable ad is currently running. This allows for a **single codebase** that can be deployed across multiple platforms without modification.\r
\r
### How It Works: A Centralized \`CTA\` Object\r
\r
The core of this strategy is to have the ad network's platform initialize a global \`CTA\` object on the \`document\`. This object is then populated with functions that the playable ad can call. The ad itself doesn't need to know the specific implementation details of the network's SDK; it only needs to know that it can call standardized methods on \`document.CTA\`.\r
\r
Let's break down how your \`App.ts\` code leverages this pattern.\r
\r
#### 1. Game Events and CTA Calls\r
\r
Your code defines several key methods that trigger actions through the \`CTA\` object. These methods are called at critical points in the game's lifecycle.\r
\r
* **\`callCta()\`**: This is the primary "call to action" function. When the user is prompted to install the app, this function is invoked. It first mutes the game's sound, signals that the game has ended, and then calls the \`onClick\` method on the \`CTA\` object. This \`onClick\` function is what the ad network provides to open the app store link.\r
\r
  \`\`\`typescript\r
  callCta() {\r
    this.mute();\r
    this.onGameEnd();\r
    document["CTA"]?.onClick?.(); // Triggers the app store\r
    console.log("CTA clicked");\r
  }\r
  \`\`\`\r
\r
* **\`onGameEnd()\` and \`onGameReady()\`**: These functions are used for tracking and analytics. Ad networks often require the ad to signal when it's ready to be interacted with and when the "gameplay" portion is complete. This is crucial for measuring engagement.\r
\r
  \`\`\`typescript\r
  onGameEnd() {\r
    document["CTA"]?.gameEnd?.(); // Signals the end of gameplay\r
  }\r
  \r
  onGameReady() {\r
    console.log("game ready");\r
    document["CTA"]?.gameReady?.(); // Signals the ad is loaded and interactive\r
  }\r
  \`\`\`\r
\r
The optional chaining (\`?.\`) is a critical part of this implementation. It ensures that if the \`CTA\` object or one of its methods doesn't exist (for example, when testing in a local browser environment), the code will not throw an error.\r
\r
#### 2. Initializing the Bridge\r
\r
The \`startGame\` function is responsible for setting up the connection between your game's internal logic and the external \`CTA\` object provided by the ad network. It assigns your game's \`mute\` and \`unmute\` functions to the \`CTA\` object, allowing the ad network's UI (like a mute button on the ad container) to control the sound within your game.\r
\r
\`\`\`typescript\r
function startGame() {\r
  //prevent multiple starts\r
  if (isStarted) return;\r
  isStarted = true;\r
\r
  const app = new App();\r
  if (cta) {\r
    cta["mute"] = () => app.mute();\r
    cta["unmute"] = () => app.unmute();\r
  }\r
  app.init();\r
}\r
\`\`\`\r
\r
This two-way communication is powerful. The game can call the network's functions (\`onClick\`), and the network's chrome can call the game's functions (\`mute\`/\`unmute\`).\r
\r
### The "Single Codebase" Advantage\r
\r
By abstracting away the platform-specific details behind the \`CTA\` object, the core game logic remains clean and independent.\r
\r
* **On ironSource**, the platform's script would define \`document.CTA = { onClick: () => dapi.openStoreUrl(), ... }\`.\r
* **On another network**, it might be \`document.CTA = { onClick: () => mraid.open(), ... }\`.\r
\r
Your game code doesn't change. It simply calls \`document.CTA.onClick()\`, and the correct, platform-specific function is executed. This dramatically simplifies the process of developing and deploying playable ads, saving time and reducing the potential for errors. Your code elegantly handles this by creating a flexible and robust bridge to any ad network's API.\r
`;var yn=Object.getOwnPropertyDescriptor,wn=(s,e,t,n)=>{for(var r=n>1?void 0:n?yn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Qt=class extends L{constructor(){super(...arguments),this.markdownHtml=""}connectedCallback(){super.connectedCallback();const s=T.parse(bn);typeof s=="string"&&(this.markdownHtml=s),this.requestUpdate()}render(){return E`
      <div class="cta-sdk-info">
        <div>${Rs(this.markdownHtml)}</div>
      </div>
    `}};Qt=wn([B("cta-sdk-page"),ke("/cta-sdk",{title:"CTA SDK Documentation",description:"Documentation for the CTA SDK, providing guidance on how to integrate and use the SDK in your playable ads."})],Qt);var kn=Object.getOwnPropertyDescriptor,vn=(s,e,t,n)=>{for(var r=n>1?void 0:n?kn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Xt=class extends L{render(){return E`
      <h1>Gritsenko Playable Ads Tools</h1>

      <p>
        This app provides a collection of open-source, useful tools for HTML5
        playable ads developers.
      </p>

      <h2>Core Features:</h2>
      <ul class="feature-list">
        <li>
          <strong>Publish to Ad Networks:</strong> Streamline the process of
          deploying your playable ads to various advertising networks.
        </li>
        <li>
          <strong>Assets Compression:</strong> Optimize your images, scripts,
          and other assets to reduce file size and improve loading times.
        </li>
        <li>
          <strong>Ad Network Requirements:</strong> Stay up-to-date with the
          specific requirements and specifications for different ad networks.
        </li>
        <li>
          <strong>Playable Ads Validator:</strong> Check your ads against common
          standards and network rules to ensure compatibility and performance.
        </li>
        <li>
          <strong>Playable Ads Sharing:</strong> Easily share your playable ad
          creations for testing and previews.
        </li>
      </ul>
    `}};Xt=vn([B("home-page"),ke("/",{title:"Playable Tools for HTML5 Ads",description:"A collection of open-source tools for HTML5 playable ads developers, including publishing, asset compression, and validation."})],Xt);const $n="modulepreload",xn=function(s){return"/PlayableTools/"+s},Jt={},_n=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let h=function(p){return Promise.all(p.map(f=>Promise.resolve(f).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),o=a?.nonce||a?.getAttribute("nonce");r=h(t.map(p=>{if(p=xn(p),p in Jt)return;Jt[p]=!0;const f=p.endsWith(".css"),m=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${p}"]${m}`))return;const k=document.createElement("link");if(k.rel=f?"stylesheet":$n,f||(k.as="script"),k.crossOrigin="",k.href=p,o&&k.setAttribute("nonce",o),document.head.appendChild(k),f)return new Promise((x,S)=>{k.addEventListener("load",x),k.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${p}`)))})}))}function i(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return r.then(a=>{for(const o of a||[])o.status==="rejected"&&i(o.reason);return e().catch(i)})};class _r{static getBaseDir(){const e=window.location.origin+window.location.pathname.replace(/([?#].*)$/,"");return e.endsWith("/")?e:e+"/"}static buildFetchUrl(e,t){return this.getBaseDir()+e+t}}const Sn={replaceTokens:{'<script type="module" crossorigin>':"<script>"}},Pn=[{Name:"Facebook",InjeectScripts:["cta.Facebook.js"]},{Name:"Moloco",InjeectScripts:["cta.Moloco.js"],replaceTokens:{XMLHttpRequest:"XRQ"}},{Name:"Facebook_Zip",format:"zip",ExtractScripts:!0,InjeectScripts:["cta.Facebook_Zip.js"]},{Name:"Mintegral",format:"zip",OutputIndexHtmlName:"%name%.html",InjeectScripts:["cta.Mintegral.js"]},{Name:"IronSource",InjeectScripts:["cta.IronSource.js"]},{Name:"AdColony",InjeectScripts:["cta.AdColony.js"]},{Name:"Unity",InjeectScripts:["cta.Unity.js"]},{Name:"Applovin",InjeectScripts:["cta.Applovin.js"]},{Name:"Vungle",OutputIndexHtmlName:"ad.html",format:"zip",ExtraFiles:[{from:"./Vungle/index.html",to:"./index.html"}],InjeectScripts:["cta.Vungle.js"]},{Name:"TikTok",format:"zip",OutputIndexHtmlName:"index.html",ExtraFiles:[{from:"./TikTok/config.json",to:"./config.json"}],InjeectScripts:["cta.TikTok.js"]},{Name:"Google",OutputIndexHtmlName:"index.html",format:"zip",Sizes:{"320x480":"width=320,height=480","480x320":"width=480,height=320","300x250":"width=300,height=250"},InjeectScripts:["cta.Google.js"],replaceTokens:{"</title>":'</title> <meta name="ad.size" content="{{ad.size}}"><meta name="ad.orientation" content="landscape">'}}],An={globalDefaults:Sn,platforms:Pn};var Tn=Object.getOwnPropertyDescriptor,Cn=(s,e,t,n)=>{for(var r=n>1?void 0:n?Tn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Qe=class{constructor(){this.config=[],this.globalDefaults={},this.loadConfig(An)}loadConfig(s){if(Array.isArray(s.platforms))this.config=s.platforms,s.globalDefaults&&typeof s.globalDefaults=="object"&&(this.globalDefaults=s.globalDefaults),console.log("PlayablePublishService: Loaded platforms config:",this.config);else throw new Error("Invalid config: platforms array missing")}getPlatforms(){return this.config}getAvailablePlatforms(){return this.config.map(s=>s.Name)}async processHtml(s,e,t){const n=this.config.find(o=>o.Name===e);if(!n)throw new Error(`Platform '${e}' not found in config`);let r=s,i=performance.now();n.replaceTokens&&(r=this.applyReplaceTokens(r,n.replaceTokens));let a=performance.now();if(console.log(`[PlayablePublishService] Platform replaceTokens (${e}): ${(a-i).toFixed(2)} ms`),n.InjeectScripts&&Array.isArray(n.InjeectScripts)){let o=performance.now();r=await this.injectScripts(r,n.InjeectScripts);let h=performance.now();console.log(`[PlayablePublishService] Script injection (${e}): ${(h-o).toFixed(2)} ms`)}return n.OutputIndexHtmlName&&t?.name,r}applyReplaceTokens(s,e){if(!e||Object.keys(e).length===0)return s;const t=Object.keys(e).map(r=>r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),n=new RegExp(t.join("|"),"g");return s.replace(n,r=>e[r]??r)}async injectScripts(s,e){let t=s;const n=e.map(async i=>{try{const a=_r.buildFetchUrl("publish-data/",i),o=await fetch(a);return o.ok?`<script>
${await o.text()}
<\/script>`:(console.warn(`Could not load script: ${i} from ${a}`),null)}catch(a){return console.warn(`Failed to inject script ${i}:`,a),null}}),r=(await Promise.all(n)).filter(Boolean);for(const i of r)if(/<head[^>]*>/i.test(t)){const a=t.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);if(a){const o=a[2],h=o.match(/<script[^>]*>/i);if(h){const p=a.index+a[1].length+o.indexOf(h[0]);t=t.slice(0,p)+`
${i}
`+t.slice(p)}else t=t.replace(/<\/head>/i,`${i}
</head>`)}}else/<\/body>/i.test(t)?t=t.replace(/<\/body>/i,`${i}
</body>`):t=t+i;return t}async processAllPlatforms(s,e){if(!e.outputDirectory)throw new Error("Output directory is required");const t=e.name||"Playable",n=e.suffix||"EN";let r=s,i=performance.now();this.globalDefaults.replaceTokens&&(r=this.applyReplaceTokens(r,this.globalDefaults.replaceTokens));let a=performance.now();console.log(`[PlayablePublishService] Global replaceTokens: ${(a-i).toFixed(2)} ms`);let o=this.config;e.selectedPlatforms&&Array.isArray(e.selectedPlatforms)&&e.selectedPlatforms.length>0&&(o=this.config.filter(f=>e.selectedPlatforms.includes(f.Name)));const h=o.length;let p=0;for(const f of o){const m=await this.createPlatformDirectory(e.outputDirectory,f.Name),k=await this.processHtml(r,f.Name,e),x=this.generateFileName(t,f.Name,n,f);f.format==="zip"?await this.createZipPackageToDirectory(k,x,m,f):await this.saveHtmlFileToDirectory(k,x,m),p++;const S=30+p/h*70;e.onProgress?.(S,f.Name)}}generateFileName(s,e,t,n){return n.OutputIndexHtmlName?n.OutputIndexHtmlName.includes("%name%")?n.OutputIndexHtmlName.replace("%name%",s):n.OutputIndexHtmlName:`${s}_${e}_${t}.html`}async createPlatformDirectory(s,e){try{const t=await s.getDirectoryHandle(e,{create:!0});return console.log(`Created/accessed directory: ${e}`),t}catch(t){throw new Error(`Failed to create platform directory ${e}: ${t}`)}}async saveHtmlFileToDirectory(s,e,t){let n=performance.now();try{const a=await(await t.getFileHandle(e,{create:!0})).createWritable();await a.write(s),await a.close();const o=(s.length/1024).toFixed(2);console.log(`Saved HTML file: ${e} (${o} KB)`)}catch(i){throw new Error(`Failed to save HTML file ${e}: ${i}`)}let r=performance.now();console.log(`[PlayablePublishService] Save HTML (${e}): ${(r-n).toFixed(2)} ms`)}async createZipPackageToDirectory(s,e,t,n){try{const r=(await _n(async()=>{const{default:M}=await import("./jszip.min-DXVGwAHG.js").then(z=>z.j);return{default:M}},[])).default,i=new r;if(i.file(e,s),n.ExtraFiles)for(const M of n.ExtraFiles)try{const z=`/publish-data/${M.from.replace("./","")}`,H=await fetch(z);if(H.ok){const K=await H.text();i.file(M.to.replace("./",""),K)}else console.warn(`Could not load extra file from: ${z}`)}catch(z){console.warn(`Could not load extra file: ${M.from}`,z)}let a=performance.now();const o=await i.generateAsync({type:"blob"});let h=performance.now();console.log(`[PlayablePublishService] Zipping (${e}): ${(h-a).toFixed(2)} ms`);let p=performance.now();const f=e.replace(".html",".zip"),k=await(await t.getFileHandle(f,{create:!0})).createWritable();await k.write(o),await k.close();let x=performance.now();console.log(`[PlayablePublishService] Save ZIP (${f}): ${(x-p).toFixed(2)} ms`);const S=(o.size/1024).toFixed(2);console.log(`Saved ZIP file: ${f} (${S} KB)`)}catch(r){throw new Error(`Failed to create ZIP package ${e}: ${r}`)}}async requestOutputDirectory(){if("showDirectoryPicker"in window)try{const s=await window.showDirectoryPicker();return console.log(`Selected output directory: ${s.name}`),s}catch(s){throw s instanceof Error&&s.name==="AbortError"?new Error("Directory selection was cancelled"):new Error(`Failed to select directory: ${s}`)}else throw new Error("File System Access API is not supported in this browser. Please use Chrome, Edge, or another supported browser.")}};Qe=Cn([ls(ge.Singleton)],Qe);var En=Object.defineProperty,Mn=(s,e,t,n)=>{for(var r=void 0,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(e,t,r)||r);return r&&En(e,t,r),r};class Sr extends L{constructor(){super(...arguments),this.dragActive=!1,this.loadedFile=null,this.isPublishing=!1,this.publishProgress=0,this.currentPlatform=null,this.publishStartTime=null,this.publishElapsed=null,this.playableTitle="",this.googlePlayUrl="",this.appStoreUrl="",this.customSuffix="EN",this.outputDirectory="",this.availablePlatforms=[],this.selectedPlatforms=[],this.STORAGE_KEYS={playableTitle:"playable-publisher-title",googlePlayUrl:"playable-publisher-google-url",appStoreUrl:"playable-publisher-app-store-url",customSuffix:"playable-publisher-suffix",selectedPlatforms:"playable-publisher-selected-platforms"}}connectedCallback(){super.connectedCallback(),this.loadFromLocalStorage(),this.playablePublishService&&typeof this.playablePublishService.getAvailablePlatforms=="function"&&(this.availablePlatforms=this.playablePublishService.getAvailablePlatforms(),(!this.selectedPlatforms||this.selectedPlatforms.length===0)&&(this.selectedPlatforms=[...this.availablePlatforms]))}render(){return E`
      <div class="playable-publisher">
        <div style="margin-bottom:1.5rem">
          <strong>Publish Playable Ad</strong><br />
          <small>
            Use this tool to upload your playable ad HTML file and prepare it
            for different platforms.<br />
            Drop your .html file below or select it manually.
          </small>
        </div>

        ${this.loadedFile?E`
              <div class="file-loaded-info">
                <strong>File loaded:</strong> ${this.loadedFile.name}
                (${(this.loadedFile.size/1024).toFixed(2)} KB)

                ${this.isPublishing?E`
                      <div class="progress-container">
                        <div class="progress-text">
                          Publishing... ${Math.round(this.publishProgress)}%
                          ${this.currentPlatform?E`<span style="margin-left:1em;">(${this.currentPlatform})</span>`:""}
                        </div>
                        <div class="progress-bar-background">
                          <div 
                            class="progress-bar-fill"
                            style="width: ${this.publishProgress}%;"
                          ></div>
                        </div>
                      </div>
                    `:null}
              </div>
            `:E`
              <div
                class="dropzone ${this.dragActive?"dragover":""}"
                @dragover=${this._onDragOver}
                @dragleave=${this._onDragLeave}
                @drop=${this._onDrop}
              >
                <p>Drop your .html file here or</p>
                <label class="file-select-button">
                  Select file
                  <input
                    type="file"
                    accept=".html"
                    @change=${this._onFileChange}
                  />
                </label>
              </div>
            `}

        <!-- Form inputs: only show when file is loaded -->
        ${this.loadedFile?E`
          <div class="form-section compact-form" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h3 style="margin: 0; font-size: 1.1rem;">Playable Configuration</h3>
            </div>
            <div class="form-row compact-row">
              <label for="playableTitle">Playable Title:</label>
              <input
                id="playableTitle"
                type="text"
                .value=${this.playableTitle}
                @input=${e=>{this.updateField("playableTitle",e.target.value)}}
                placeholder="e.g., GoH_PBCustomHero3D"
                style="margin-left: 8px;"
              />
            </div>
            <div class="form-row compact-row">
              <label for="googlePlayUrl">Google Play URL:</label>
              <input
                id="googlePlayUrl"
                type="url"
                .value=${this.googlePlayUrl}
                @input=${e=>{this.updateField("googlePlayUrl",e.target.value)}}
                placeholder="https://play.google.com/store/apps/details?id=..."
                style="margin-left: 8px;"
              />
            </div>
            <div class="form-row compact-row">
              <label for="appStoreUrl">App Store URL:</label>
              <input
                id="appStoreUrl"
                type="url"
                .value=${this.appStoreUrl}
                @input=${e=>{this.updateField("appStoreUrl",e.target.value)}}
                placeholder="https://apps.apple.com/app/..."
                style="margin-left: 8px;"
              />
            </div>
            <div class="form-row compact-row">
              <label for="customSuffix">Custom Suffix:</label>
              <input
                id="customSuffix"
                type="text"
                .value=${this.customSuffix}
                @input=${e=>{this.updateField("customSuffix",e.target.value)}}
                placeholder="EN"
                style="width: 60px; margin-left: 8px;"
              />
            </div>

            <!-- Platform checklist -->
            <div class="form-row compact-row platform-section">
              <label class="platform-label">Platforms:</label>
              <div class="platform-content">
                <div class="platform-actions">
                  <a href="#" @click=${this._selectAllPlatforms} class="platform-link">Select all</a>
                  <a href="#" @click=${this._clearAllPlatforms} class="platform-link">Clear all</a>
                </div>
                <div class="platform-grid">
                  ${this.availablePlatforms.map(e=>E`
                    <label class="platform-checkbox">
                      <input
                        type="checkbox"
                        .checked=${this.selectedPlatforms.includes(e)}
                        @change=${t=>this._onPlatformCheckboxChange(t,e)}
                      />
                      <span>${e}</span>
                    </label>
                  `)}
                </div>
              </div>
            </div>
          </div>
        `:null}

        <!-- Publish/Cancel buttons below the form -->
        <div style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem; justify-content: center;">
          ${this.loadedFile&&this.playableTitle&&!this.isPublishing?E`
            <button 
              @click=${this._publishPlayable}
              style="margin-right: 0.5rem;"
              ?disabled=${!this.selectedPlatforms.length}
            >
              Publish
            </button>
          `:null}
          ${this.loadedFile&&!this.isPublishing?E`
            <button 
              @click=${this._resetFile}
            >
              Cancel
            </button>
          `:null}
        </div>
      </div>
    `}_onPlatformCheckboxChange(e,t){e.target.checked?this.selectedPlatforms.includes(t)||(this.selectedPlatforms=[...this.selectedPlatforms,t]):this.selectedPlatforms=this.selectedPlatforms.filter(r=>r!==t),this.saveToLocalStorage(),this.requestUpdate()}_selectAllPlatforms(e){e.preventDefault(),this.selectedPlatforms=[...this.availablePlatforms],this.saveToLocalStorage(),this.requestUpdate()}_clearAllPlatforms(e){e.preventDefault(),this.selectedPlatforms=[],this.saveToLocalStorage(),this.requestUpdate()}_onDragOver(e){e.preventDefault(),this.dragActive=!0,this.requestUpdate()}_onDragLeave(e){e.preventDefault(),this.dragActive=!1,this.requestUpdate()}_onDrop(e){e.preventDefault(),this.dragActive=!1,this.requestUpdate();const t=e.dataTransfer?.files;t&&t.length&&this._processFile(t[0])}_onFileChange(e){const n=e.target.files?.[0];n&&this._processFile(n)}_processFile(e){if(e&&e.name.endsWith(".html")){this.loadedFile=e,this.requestUpdate();const t=new CustomEvent("file-selected",{detail:e});this.dispatchEvent(t)}else alert("Please select a valid .html file.")}_resetFile(){this.loadedFile=null,this.requestUpdate()}async _publishPlayable(){if(!this.loadedFile||!this.playableTitle){alert("Please provide a playable title and select a file.");return}if(!this.selectedPlatforms||this.selectedPlatforms.length===0){alert("Please select at least one platform to publish.");return}try{this.isPublishing=!0,this.publishProgress=0,this.currentPlatform=null,this.publishElapsed=null,this.requestUpdate(),this.publishProgress=10,this.requestUpdate();const e=await this.playablePublishService.requestOutputDirectory();this.publishStartTime=Date.now(),this.publishProgress=20,this.requestUpdate();const t=await this._readFileContent(this.loadedFile),n={name:this.playableTitle,title:this.playableTitle,googlePlayUrl:this.googlePlayUrl,appStoreUrl:this.appStoreUrl,suffix:this.customSuffix,outputDirectory:e,onProgress:(r,i)=>{this.publishProgress=r,i&&(this.currentPlatform=i),this.requestUpdate()},selectedPlatforms:[...this.selectedPlatforms]};if(this.publishProgress=30,this.requestUpdate(),await this.playablePublishService.processAllPlatforms(t,n),this.publishProgress=100,this.currentPlatform=null,this.publishStartTime){const r=Date.now()-this.publishStartTime;this.publishElapsed=this._formatElapsed(r)}this.requestUpdate(),setTimeout(()=>{let r="Publishing completed successfully! Files have been saved to the selected directory with subfolders for each platform.";this.publishElapsed&&(r+=`

Elapsed time: ${this.publishElapsed}`),alert(r),this.isPublishing=!1,this.publishProgress=0,this.publishElapsed=null,this.publishStartTime=null,this.requestUpdate()},500)}catch(e){console.error("Publishing failed:",e);let t=e instanceof Error?e.message:"Unknown error";t.includes("File System Access API is not supported")&&(t+=`

For best results, please use Chrome 86+, Edge 86+, or another browser that supports the File System Access API.`),alert(`Publishing failed: ${t}`),this.isPublishing=!1,this.publishProgress=0,this.requestUpdate()}}_formatElapsed(e){const t=Math.floor(e/1e3),n=Math.floor(t/60),r=t%60;return n>0?`${n}m ${r}s`:`${r}s`}_readFileContent(e){return new Promise((t,n)=>{const r=new FileReader;r.onload=i=>{const a=i.target?.result;typeof a=="string"?t(a):n(new Error("Failed to read file as text"))},r.onerror=()=>n(new Error("Failed to read file")),r.readAsText(e)})}loadFromLocalStorage(){this.playableTitle=localStorage.getItem(this.STORAGE_KEYS.playableTitle)||"",this.googlePlayUrl=localStorage.getItem(this.STORAGE_KEYS.googlePlayUrl)||"",this.appStoreUrl=localStorage.getItem(this.STORAGE_KEYS.appStoreUrl)||"",this.customSuffix=localStorage.getItem(this.STORAGE_KEYS.customSuffix)||"EN";const e=localStorage.getItem(this.STORAGE_KEYS.selectedPlatforms);if(e)try{const t=JSON.parse(e);Array.isArray(t)&&(this.selectedPlatforms=t)}catch{}this.requestUpdate()}saveToLocalStorage(){localStorage.setItem(this.STORAGE_KEYS.playableTitle,this.playableTitle),localStorage.setItem(this.STORAGE_KEYS.googlePlayUrl,this.googlePlayUrl),localStorage.setItem(this.STORAGE_KEYS.appStoreUrl,this.appStoreUrl),localStorage.setItem(this.STORAGE_KEYS.customSuffix,this.customSuffix),localStorage.setItem(this.STORAGE_KEYS.selectedPlatforms,JSON.stringify(this.selectedPlatforms))}updateField(e,t){switch(e){case"playableTitle":this.playableTitle=t;break;case"googlePlayUrl":this.googlePlayUrl=t;break;case"appStoreUrl":this.appStoreUrl=t;break;case"customSuffix":this.customSuffix=t;break}this.saveToLocalStorage(),this.requestUpdate()}}Mn([cs(Qe)],Sr.prototype,"playablePublishService");customElements.define("playable-publisher",Sr);var On=Object.getOwnPropertyDescriptor,Rn=(s,e,t,n)=>{for(var r=n>1?void 0:n?On(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let er=class extends L{render(){return E`
      <div class="warning-notice">
        <strong>Important:</strong> You must integrate the CTA SDK into your playable ad for successful publishing. See <a href="#cta-sdk" >cta-sdk</a> for instructions.
      </div>
      <playable-publisher></playable-publisher>

      <style>
        .warning-notice {
          background: var(--pico-mark-background-color);
          color: var(--pico-mark-color);
          border: 1px solid var(--pico-mark-background-color);
          padding: 1em;
          margin-bottom: 1em;
          border-radius: var(--pico-border-radius);
        }
      </style>
    `}};er=Rn([B("publish-page"),ke("/publish",{title:"Publish Playable Ads",description:"Publish your playable ads to multiple ad networks with ease. This tool streamlines the process of deploying your ads."})],er);var In=Object.getOwnPropertyDescriptor,Dn=(s,e,t,n)=>{for(var r=n>1?void 0:n?In(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let tr=class extends L{render(){return E`
      <section class="validate-page">
        <h1>Technical Requirements of Ad Networks</h1>
        <p>
          Playable ads must comply with the technical specifications set by
          various ad networks to ensure compatibility and optimal performance.
          Below are requirements and validation tools for major networks:
        </p>
        <ul class="ad-network-list">
          <li>
            <strong>Facebook Ads</strong> — <em>2MB (HTML), 5MB (ZIP)</em><br />
            <span>
              <a
                href="https://developers.facebook.com/tools/playable-preview/"
                target="_blank"
                >Playable Preview</a
              >
              <small
                >(public tool does not test ZIPs; use Ads Manager for full
                validation)</small
              ></span
            >
            <br />
            <small>
              <strong>Testing:</strong> Use the Facebook Playable Preview tool. Drag your file in and check for errors. All specification items must be green before uploading to Ads Manager.
            </small>
          </li>
          <li>
            <strong>Google Adwords</strong> — <em>5MB (ZIP)</em><br />
            <span>
              <a
                href="https://h5validator.appspot.com/dcm/asset"
                target="_blank"
                >H5 Validator</a
              ></span
            >
            <br />
            <small>
              <strong>Note:</strong> Zip file name length errors can be ignored. Use the correct compressed package and check for format issues.
            </small>
          </li>
          <li>
            <strong>Unity</strong> — <em>5MB (HTML)</em><br />
            <span>
              <a
                href="https://apps.apple.com/us/app/ad-testing/id1463016906"
                target="_blank"
                >iOS Validator</a
              >,
              <a
                href="https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp&hl=en_US"
                target="_blank"
                >Android Validator</a
              ></span
            ><br />
            <small>
              <strong>Testing:</strong> Use the Unity test app, paste your playable ad URL, and check for issues in the Creative report. App store links must use the <code>apps.apple.com/</code> domain for iOS.
            </small>
          </li>
          <li>
            <strong>AppLovin</strong> — <em>5MB (HTML)</em><br />
            <span>
              <a
                href="https://p.applov.in/playablePreview?create=1&qr=1"
                target="_blank"
                >Web Validator</a
              >,
              <a
                href="https://apps.apple.com/us/app/playable-preview/id6468529760"
                target="_blank"
                >iOS App</a
              >,
              <a
                href="https://install.appcenter.ms/orgs/iosdeveloper-dbmy/apps/android-playable-preview/distribution_groups/all-users-of-android-playable-preview"
                target="_blank"
                >Android App</a
              ></span
            >
            <br />
            <small>
              <strong>Testing:</strong> Use the Applovin preview tool. Contact Applovin for permission if using external requests (analytics), or your playable may be rejected.
            </small>
          </li>
          <li>
            <strong>IronSource</strong> — <em>5MB (HTML)</em><br />
            <span>Validation: Only in Ads Manager</span><br />
            <small>
              <strong>Testing:</strong> The ironSource test tool is deprecated. Submit your build for review in the ironSource dashboard. See the <a href="https://developers.is.com/ironsource-mobile/general/html-upload/" target="_blank">official guide</a>.
            </small>
            <br />
            <small>From 2025, accepts Unity builds in MRAID (not DAPI).</small>
          </li>
          <li>
            <strong>Moloco</strong> — <em>5MB (HTML)</em><br />
            <span>No validation tool available</span><br />
            <small>
              Uses Facebook's format and API. Code must NOT contain <code>XMLHttpRequest</code> (remove from PixiJS/Howler if present).
            </small>
          </li>
          <li>
            <strong>TikTok</strong> — <em>5MB (ZIP)</em><br />
            <span>
              <a
                href="https://ads.tiktok.com/help/article/playable-ads"
                target="_blank"
                >Playable Ads Help</a
              >,
              <a
                href="https://bytedance.feishu.cn/docs/doccnSSJ2uAY8EYPCAtTuoX3u9"
                target="_blank"
                >Feishu Doc 1</a
              >,
              <a
                href="https://bytedance.us.feishu.cn/docs/doccnmdeT1KStyS0QdVExnVAy8v"
                target="_blank"
                >Feishu Doc 2</a
              ></span
            ><br />
            <small>
              <strong>Note:</strong> No official testing tool. <code>config.json</code> must be present in the root directory and include orientation (0-responsive, 1-portrait, 2-landscape) and language codes in <code>playable_languages</code> array.
            </small>
          </li>
          <li>
            <strong>Mintegral</strong> — <em>5MB (ZIP)</em><br />
            <span>
              <a
                href="https://www.mindworks-creative.com/review/"
                target="_blank"
                >Mindworks Review</a
              ></span
            ><br />
            <small>
              <strong>Testing:</strong> Use the Mindworks Review tool. Drag in your zip archive and check for errors. Archive name must match the main folder/file inside.
            </small>
          </li>
          <li>
            <strong>Vungle</strong> — <em>5MB (ZIP)</em><br />
            <span>
              <a
                href="https://support.vungle.com/hc/en-us/articles/4908908675355-Test-Your-Playable-Asset-With-Our-Creative-Verifier"
                target="_blank"
                >Creative Verifier</a
              ></span
            ><br />
            <small>
              <strong>Testing:</strong> See Vungle's official guide for step-by-step testing instructions.
            </small>
          </li>
          <li>
            <strong>WeChat MiniGame</strong> — <em>Special requirements</em><br />
            <span>No public validator tool</span><br />
            <small>
              <strong>Notes:</strong> No CTA button or app store redirect needed; after trial ends, user is sent to End Card. "Rigid Body" and "Video" assets are not supported. Only some templates support WeChat MiniGame export (look for WeChat logo). See <a href="https://doc.playturbo.com/other-tutorials/documentation-for-project-deployment/playable-upload-specifications-for-networks" target="_blank">Playturbo docs</a> for details.
            </small>
          </li>
        </ul>
        <h2>General Requirements</h2>
        <ul class="general-reqs">
          <li>
            <strong>File Size Limits:</strong> Most networks enforce a maximum
            file size (e.g., 2MB or 5MB) for fast loading.
          </li>
          <li>
            <strong>Supported Formats:</strong> HTML5 is the standard, but some
            networks may have additional format preferences.
          </li>
          <li>
            <strong>Loading Time:</strong> Ads should load quickly, typically
            within 1–3 seconds.
          </li>
          <li>
            <strong>Responsive Design:</strong> Playable ads should adapt to
            different screen sizes and orientations.
          </li>
          <li>
            <strong>API Integrations:</strong> Some networks require integration
            with their SDKs or specific event tracking APIs.
          </li>
          <li>
            <strong>Asset Optimization:</strong> Use compressed images, minified
            scripts, and efficient code to reduce load times.
          </li>
          <li>
            <strong>Best Practices:</strong> 
            <ul>
              <li>Unzip downloaded archives and use the inner zip for upload.</li>
              <li>Main HTML file should be named <code>index</code> and placed in the root directory.</li>
              <li>Check for channel-specific restrictions (e.g., WeChat MiniGame does not support video or rigid body assets).</li>
              <li>For TikTok, ensure <code>config.json</code> is present and correctly formatted.</li>
              <li>Always test your playable in the official validator or preview tool before submitting.</li>
            </ul>
          </li>
        </ul>
        <h2>References & Further Reading</h2>
        <ul>
          <li>
            <a href="https://doc.playturbo.com/other-tutorials/documentation-for-project-deployment/playable-upload-specifications-for-networks" target="_blank">
              Playturbo: Playable Upload Specifications for Networks
            </a>
          </li>
        </ul>
        <h2>Other Ad Networks</h2>
        <ul class="other-networks">
          <li>
            <strong>AdColony</strong>: 2MB, Single HTML file, <a href="https://www.adcolony.com/" target="_blank">AdColony</a> (iOS, Android)
          </li>
          <li>
            <strong>Liftoff</strong>: 5MB, Zip file with resources, <a href="https://liftoff.io/" target="_blank">Liftoff</a>
          </li>
          <li>
            <strong>Inmobi</strong>: 5MB, Offline script must be deployed to CDN and HTML paths updated, <a href="https://www.inmobi.com/" target="_blank">Inmobi</a>
          </li>
          <li>
            <strong>Tapjoy</strong>: 1.9MB, <a href="https://www.tapjoy.com/" target="_blank">Tapjoy</a>
          </li>
          <li>
            <strong>Pangle</strong>: 5MB, <a href="https://www.pangleglobal.com/" target="_blank">Pangle</a>
          </li>
          <li>
            <strong>myTarget</strong>: 2MB, <a href="https://target.my.com/" target="_blank">myTarget</a>
          </li>
          <li>
            <strong>Kwai</strong>: 5MB, <a href="https://www.kwai.com/" target="_blank">Kwai</a>
          </li>
          <li>
            <strong>i-mobile</strong>: 6MB, <a href="https://www.i-mobile.co.jp/" target="_blank">i-mobile</a>
          </li>
          <li>
            <strong>Snapchat</strong>: 5MB, <a href="https://forbusiness.snapchat.com/" target="_blank">Snapchat</a>
          </li>
          <li>
            <strong>Smadex</strong>: 5MB, <a href="https://www.smadex.com/" target="_blank">Smadex</a>
          </li>
          <li>
            <strong>Chartboost</strong>: 3MB, <a href="https://www.chartboost.com/" target="_blank">Chartboost</a>
          </li>
          <li>
            <strong>Bigo</strong>: 5MB, <a href="https://www.bigo.sg/" target="_blank">Bigo</a>
          </li>
          <li>
            <strong>巨量引擎</strong>: 3MB, <a href="https://www.oceanengine.com/" target="_blank">Ocean Engine</a>
          </li>
          <li>
            <strong>快手</strong>: 3MB, <a href="https://www.kuaishou.com/" target="_blank">Kuaishou</a>
          </li>
          <li>
            <strong>Tencent AMS</strong>: 3MB, <a href="https://e.qq.com/" target="_blank">Tencent AMS</a>
          </li>
          <li>
            <strong>Tencent Ads</strong>: 3MB, Zip file with resources, <a href="https://ad.qq.com/" target="_blank">Tencent Ads</a>
          </li>
          <li>
            <strong>WeChat MiniGame</strong>: 15MB, Zip with resources, <a href="https://developers.weixin.qq.com/minigame/" target="_blank">WeChat MiniGame Docs</a>
          </li>
        </ul>
      </section>
    `}};tr=Dn([B("validate-page"),ke("/validate",{title:"Ad Network Technical Requirements",description:"A comprehensive guide to the technical requirements for major ad networks, including file size limits and validation tools."})],tr);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Un=s=>s??I;var zn=Object.getOwnPropertyDescriptor,jn=(s,e,t,n)=>{for(var r=n>1?void 0:n?zn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let rr=class extends L{constructor(){super(...arguments),this.menuItems=[{label:"Home",path:"/",disabled:!1},{label:"CTA SDK",path:"/cta-sdk",disabled:!1},{label:"Publish",path:"/publish",disabled:!1},{label:"Validate",path:"/validate",disabled:!1},{label:"Compress assets",path:"/compress-assets",disabled:!1},{label:"FAQ",path:"/faq",disabled:!0}],this.handleHashChange=()=>{this.requestUpdate()}}get currentPath(){let s=window.location.hash?window.location.hash.substring(1):"";return s.startsWith("/")||(s="/"+s),s}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleHashChange)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleHashChange)}render(){return E`
      <nav aria-label="Main menu">
        <ul>
          ${this.menuItems.map(s=>{const e=this.currentPath===s.path;return E`
              <li>
                <a
                  href=${Un(s.disabled?void 0:`#${s.path.substring(1)}`)}
                  class="${e?"active":""} ${s.disabled?"disabled":""}"
                  tabindex="${s.disabled?-1:0}"
                  aria-disabled="${s.disabled}"
                  title=${s.disabled?"Coming soon":""}
                  ...=${e?{"aria-current":"page"}:{}}
                  @click=${s.disabled?t=>t.preventDefault():void 0}
                >
                  ${s.label}
                </a>
              </li>
            `})}
        </ul>
      </nav>
    `}};rr=jn([B("nav-menu")],rr);var Ln=Object.getOwnPropertyDescriptor,Hn=(s,e,t,n)=>{for(var r=n>1?void 0:n?Ln(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let sr=class extends L{render(){return E`
      <a href="/" class="site-logo-link">
        <img
          src="${_r.buildFetchUrl("","small-logo.jpg")}"
          alt="Logo"
          class="site-logo-img"
        />
        <span class="site-logo-title">
          <div class="site-logo-subheader">Gritsenko</div>
          Playable Ads Tools
        </span>
      </a>
    `}};sr=Hn([B("site-logo")],sr);var Nn=Object.defineProperty,Bn=Object.getOwnPropertyDescriptor,ft=(s,e,t,n)=>{for(var r=n>1?void 0:n?Bn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=(n?a(e,t,r):a(r))||r);return n&&r&&Nn(e,t,r),r};let we=class extends Ss{constructor(){super(...arguments),this.sidebarOpen=!1,this.deferredPrompt=null}toggleSidebar(){this.sidebarOpen=!this.sidebarOpen}closeSidebar(){this.sidebarOpen=!1}connectedCallback(){super.connectedCallback(),window.addEventListener("beforeinstallprompt",s=>{const e=s;e.preventDefault(),this.deferredPrompt=e})}suggestPWAInstall(){this.deferredPrompt?(this.deferredPrompt.prompt(),this.deferredPrompt.userChoice.then(s=>{s.outcome==="accepted"?console.log("User accepted the install prompt"):console.log("User dismissed the install prompt"),this.deferredPrompt=null})):alert("The install prompt is not available. Please use the browser menu to install the app.")}render(){return E`
      <!-- Responsive header for mobile -->
      <header class="main-header">
        <site-logo></site-logo>
        <div class="hamburger" @click="${this.toggleSidebar}">
          <div class="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>

      <!-- Sidebar overlay for mobile -->
      <div class="sidebar-overlay${this.sidebarOpen?" open":""}" @click="${this.closeSidebar}"></div>
      <div class="layout">
        <aside class="sidebar${this.sidebarOpen?" open":""}">
          <site-logo class="sidebar-header"></site-logo>
          <nav class="menu">
            <nav-menu></nav-menu>
          </nav>
          <div style="margin-top:auto; text-align:left;">
            <a href="https://github.com/gritsenko/PlayableTools" target="_blank" rel="noopener" title="GitHub Repository" style="display:inline-flex;align-items:center;gap:0.5rem;color:var(--pico-muted-color);text-decoration:none;font-size:1rem;padding:0.5rem 0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:middle;"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.525.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.099 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
              <span>GitHub</span>
            </a>
        <a href="https://t.me/playable_html5" target="_blank" rel="noopener" title="Telegram Group" style="display:inline-flex;align-items:center;gap:0.5rem;color:var(--pico-muted-color);text-decoration:none;font-size:1rem;padding:0.5rem 0;">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
            <circle cx="16" cy="16" r="14" fill="url(#paint0_linear_87_7225)"/>
            <path d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z" fill="white"/>
            <defs>
              <linearGradient id="paint0_linear_87_7225" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                <stop stop-color="#37BBFE"/>
                <stop offset="1" stop-color="#007DBB"/>
              </linearGradient>
            </defs>
          </svg>
          <span>Telegram</span>
        </a>
            <button @click="${this.suggestPWAInstall}" style="display:inline-flex;align-items:center;gap:0.5rem;color:var(--pico-muted-color);text-decoration:none;font-size:1rem;padding:0.5rem 0;border:none;background:none;cursor:pointer;">
              <img src="pwa.png" width="170" alt="PWA Badge" style="vertical-align:middle;"/>
            </button>
          </div>
        </aside>
        <main class="main">${this.body}</main>
      </div>
    `}};ft([V({attribute:!1,type:Object})],we.prototype,"body",2);ft([V({type:Boolean})],we.prototype,"sidebarOpen",2);we=ft([B("main-layout")],we);var Fn=Object.getOwnPropertyDescriptor,qn=(s,e,t,n)=>{for(var r=n>1?void 0:n?Fn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let nr=class extends L{render(){return E`
      <router-outlet .defaultLayout="${we}"></router-outlet>
    `}};nr=qn([B("app-root")],nr);export{Ut as c,Wn as g};
