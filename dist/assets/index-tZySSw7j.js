(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Z=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)};/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const xe=globalThis,Ye=xe.ShadowRoot&&(xe.ShadyCSS===void 0||xe.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,tr=Symbol(),Et=new WeakMap;let qr=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==tr)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Ye&&e===void 0){const n=t!==void 0&&t.length===1;n&&(e=Et.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Et.set(t,e))}return e}toString(){return this.cssText}};const Br=s=>new qr(typeof s=="string"?s:s+"",void 0,tr),Gr=(s,e)=>{if(Ye)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const n=document.createElement("style"),r=xe.litNonce;r!==void 0&&n.setAttribute("nonce",r),n.textContent=t.cssText,s.appendChild(n)}},Ct=Ye?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return Br(t)})(s):s;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Zr,defineProperty:Wr,getOwnPropertyDescriptor:Vr,getOwnPropertyNames:Yr,getOwnPropertySymbols:Qr,getPrototypeOf:Kr}=Object,Oe=globalThis,Ot=Oe.trustedTypes,Xr=Ot?Ot.emptyScript:"",Jr=Oe.reactiveElementPolyfillSupport,pe=(s,e)=>s,Se={toAttribute(s,e){switch(e){case Boolean:s=s?Xr:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},Qe=(s,e)=>!Zr(s,e),Rt={attribute:!0,type:String,converter:Se,reflect:!1,useDefault:!1,hasChanged:Qe};Symbol.metadata??=Symbol("metadata"),Oe.litPropertyMetadata??=new WeakMap;let ne=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Rt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&Wr(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){const{get:r,set:i}=Vr(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){const l=r?.call(this);i?.call(this,a),this.requestUpdate(e,l,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Rt}static _$Ei(){if(this.hasOwnProperty(pe("elementProperties")))return;const e=Kr(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(pe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(pe("properties"))){const t=this.properties,n=[...Yr(t),...Qr(t)];for(const r of n)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[n,r]of t)this.elementProperties.set(n,r)}this._$Eh=new Map;for(const[t,n]of this.elementProperties){const r=this._$Eu(t,n);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const r of n)t.unshift(Ct(r))}else e!==void 0&&t.push(Ct(e));return t}static _$Eu(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Gr(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&n.reflect===!0){const i=(n.converter?.toAttribute!==void 0?n.converter:Se).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){const n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const i=n.getPropertyOptions(r),a=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Se;this._$Em=r;const l=a.fromAttribute(t,i.type);this[r]=l??this._$Ej?.get(r)??l,this._$Em=null}}requestUpdate(e,t,n){if(e!==void 0){const r=this.constructor,i=this[e];if(n??=r.getPropertyOptions(e),!((n.hasChanged??Qe)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),i!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,i]of this._$Ep)this[r]=i;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[r,i]of n){const{wrapped:a}=i,l=this[r];a!==!0||this._$AL.has(r)||l===void 0||this.C(r,void 0,i,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};ne.elementStyles=[],ne.shadowRootOptions={mode:"open"},ne[pe("elementProperties")]=new Map,ne[pe("finalized")]=new Map,Jr?.({ReactiveElement:ne}),(Oe.reactiveElementVersions??=[]).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const es={attribute:!0,type:String,converter:Se,reflect:!1,hasChanged:Qe},ts=(s=es,e,t)=>{const{kind:n,metadata:r}=t;let i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),n==="setter"&&((s=Object.create(s)).wrapped=!0),i.set(t.name,s),n==="accessor"){const{name:a}=t;return{set(l){const h=e.get.call(this);e.set.call(this,l),this.requestUpdate(a,h,s)},init(l){return l!==void 0&&this.C(a,void 0,s,l),l}}}if(n==="setter"){const{name:a}=t;return function(l){const h=this[a];e.call(this,l),this.requestUpdate(a,h,s)}}throw Error("Unsupported decorator location: "+n)};function Re(s){return(e,t)=>typeof t=="object"?ts(s,e,t):((n,r,i)=>{const a=r.hasOwnProperty(i);return r.constructor.createProperty(i,n),a?Object.getOwnPropertyDescriptor(r,i):void 0})(s,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function rs(s){return Re({...s,state:!0,attribute:!1})}var Mt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function jn(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var It={};/*! *****************************************************************************
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
***************************************************************************** */var Dt;function ss(){if(Dt)return It;Dt=1;var s;return function(e){(function(t){var n=typeof globalThis=="object"?globalThis:typeof Mt=="object"?Mt:typeof self=="object"?self:typeof this=="object"?this:h(),r=i(e);typeof n.Reflect<"u"&&(r=i(n.Reflect,r)),t(r,n),typeof n.Reflect>"u"&&(n.Reflect=e);function i(p,f){return function(m,k){Object.defineProperty(p,m,{configurable:!0,writable:!0,value:k}),f&&f(m,k)}}function a(){try{return Function("return this;")()}catch{}}function l(){try{return(0,eval)("(function() { return this; })()")}catch{}}function h(){return a()||l()}})(function(t,n){var r=Object.prototype.hasOwnProperty,i=typeof Symbol=="function",a=i&&typeof Symbol.toPrimitive<"u"?Symbol.toPrimitive:"@@toPrimitive",l=i&&typeof Symbol.iterator<"u"?Symbol.iterator:"@@iterator",h=typeof Object.create=="function",p={__proto__:[]}instanceof Array,f=!h&&!p,m={create:h?function(){return Fe(Object.create(null))}:p?function(){return Fe({__proto__:null})}:function(){return Fe({})},has:f?function(o,c){return r.call(o,c)}:function(o,c){return c in o},get:f?function(o,c){return r.call(o,c)?o[c]:void 0}:function(o,c){return o[c]}},k=Object.getPrototypeOf(Function),x=typeof Map=="function"&&typeof Map.prototype.entries=="function"?Map:jr(),S=typeof Set=="function"&&typeof Set.prototype.entries=="function"?Set:Lr(),C=typeof WeakMap=="function"?WeakMap:Hr(),z=i?Symbol.for("@reflect-metadata:registry"):void 0,L=Dr(),V=Ur(L);function we(o,c,u,d){if($(u)){if(!vt(o))throw new TypeError;if(!$t(c))throw new TypeError;return Ar(o,c)}else{if(!vt(o))throw new TypeError;if(!D(c))throw new TypeError;if(!D(d)&&!$(d)&&!se(d))throw new TypeError;return se(d)&&(d=void 0),u=N(u),Tr(o,c,u,d)}}t("decorate",we);function ke(o,c){function u(d,v){if(!D(d))throw new TypeError;if(!$(v)&&!Mr(v))throw new TypeError;mt(o,c,d,v)}return u}t("metadata",ke);function ze(o,c,u,d){if(!D(u))throw new TypeError;return $(d)||(d=N(d)),mt(o,c,u,d)}t("defineMetadata",ze);function le(o,c,u){if(!D(c))throw new TypeError;return $(u)||(u=N(u)),dt(o,c,u)}t("hasMetadata",le);function Y(o,c,u){if(!D(c))throw new TypeError;return $(u)||(u=N(u)),je(o,c,u)}t("hasOwnMetadata",Y);function $r(o,c,u){if(!D(c))throw new TypeError;return $(u)||(u=N(u)),ft(o,c,u)}t("getMetadata",$r);function xr(o,c,u){if(!D(c))throw new TypeError;return $(u)||(u=N(u)),gt(o,c,u)}t("getOwnMetadata",xr);function _r(o,c){if(!D(o))throw new TypeError;return $(c)||(c=N(c)),bt(o,c)}t("getMetadataKeys",_r);function Sr(o,c){if(!D(o))throw new TypeError;return $(c)||(c=N(c)),yt(o,c)}t("getOwnMetadataKeys",Sr);function Pr(o,c,u){if(!D(c))throw new TypeError;if($(u)||(u=N(u)),!D(c))throw new TypeError;$(u)||(u=N(u));var d=oe(c,u,!1);return $(d)?!1:d.OrdinaryDeleteMetadata(o,c,u)}t("deleteMetadata",Pr);function Ar(o,c){for(var u=o.length-1;u>=0;--u){var d=o[u],v=d(c);if(!$(v)&&!se(v)){if(!$t(v))throw new TypeError;c=v}}return c}function Tr(o,c,u,d){for(var v=o.length-1;v>=0;--v){var O=o[v],U=O(c,u,d);if(!$(U)&&!se(U)){if(!D(U))throw new TypeError;d=U}}return d}function dt(o,c,u){var d=je(o,c,u);if(d)return!0;var v=He(c);return se(v)?!1:dt(o,v,u)}function je(o,c,u){var d=oe(c,u,!1);return $(d)?!1:kt(d.OrdinaryHasOwnMetadata(o,c,u))}function ft(o,c,u){var d=je(o,c,u);if(d)return gt(o,c,u);var v=He(c);if(!se(v))return ft(o,v,u)}function gt(o,c,u){var d=oe(c,u,!1);if(!$(d))return d.OrdinaryGetOwnMetadata(o,c,u)}function mt(o,c,u,d){var v=oe(u,d,!0);v.OrdinaryDefineOwnMetadata(o,c,u,d)}function bt(o,c){var u=yt(o,c),d=He(o);if(d===null)return u;var v=bt(d,c);if(v.length<=0)return u;if(u.length<=0)return v;for(var O=new S,U=[],_=0,g=u;_<g.length;_++){var b=g[_],y=O.has(b);y||(O.add(b),U.push(b))}for(var w=0,P=v;w<P.length;w++){var b=P[w],y=O.has(b);y||(O.add(b),U.push(b))}return U}function yt(o,c){var u=oe(o,c,!1);return u?u.OrdinaryOwnMetadataKeys(o,c):[]}function wt(o){if(o===null)return 1;switch(typeof o){case"undefined":return 0;case"boolean":return 2;case"string":return 3;case"symbol":return 4;case"number":return 5;case"object":return o===null?1:6;default:return 6}}function $(o){return o===void 0}function se(o){return o===null}function Er(o){return typeof o=="symbol"}function D(o){return typeof o=="object"?o!==null:typeof o=="function"}function Cr(o,c){switch(wt(o)){case 0:return o;case 1:return o;case 2:return o;case 3:return o;case 4:return o;case 5:return o}var u="string",d=xt(o,a);if(d!==void 0){var v=d.call(o,u);if(D(v))throw new TypeError;return v}return Or(o)}function Or(o,c){var u,d,v;{var O=o.toString;if(ve(O)){var d=O.call(o);if(!D(d))return d}var u=o.valueOf;if(ve(u)){var d=u.call(o);if(!D(d))return d}}throw new TypeError}function kt(o){return!!o}function Rr(o){return""+o}function N(o){var c=Cr(o);return Er(c)?c:Rr(c)}function vt(o){return Array.isArray?Array.isArray(o):o instanceof Object?o instanceof Array:Object.prototype.toString.call(o)==="[object Array]"}function ve(o){return typeof o=="function"}function $t(o){return typeof o=="function"}function Mr(o){switch(wt(o)){case 3:return!0;case 4:return!0;default:return!1}}function Le(o,c){return o===c||o!==o&&c!==c}function xt(o,c){var u=o[c];if(u!=null){if(!ve(u))throw new TypeError;return u}}function _t(o){var c=xt(o,l);if(!ve(c))throw new TypeError;var u=c.call(o);if(!D(u))throw new TypeError;return u}function St(o){return o.value}function Pt(o){var c=o.next();return c.done?!1:c}function At(o){var c=o.return;c&&c.call(o)}function He(o){var c=Object.getPrototypeOf(o);if(typeof o!="function"||o===k||c!==k)return c;var u=o.prototype,d=u&&Object.getPrototypeOf(u);if(d==null||d===Object.prototype)return c;var v=d.constructor;return typeof v!="function"||v===o?c:v}function Ir(){var o;!$(z)&&typeof n.Reflect<"u"&&!(z in n.Reflect)&&typeof n.Reflect.defineMetadata=="function"&&(o=zr(n.Reflect));var c,u,d,v=new C,O={registerProvider:U,getProvider:g,setProvider:y};return O;function U(w){if(!Object.isExtensible(O))throw new Error("Cannot add provider to a frozen registry.");switch(!0){case o===w:break;case $(c):c=w;break;case c===w:break;case $(u):u=w;break;case u===w:break;default:d===void 0&&(d=new S),d.add(w);break}}function _(w,P){if(!$(c)){if(c.isProviderFor(w,P))return c;if(!$(u)){if(u.isProviderFor(w,P))return c;if(!$(d))for(var E=_t(d);;){var R=Pt(E);if(!R)return;var H=St(R);if(H.isProviderFor(w,P))return At(E),H}}}if(!$(o)&&o.isProviderFor(w,P))return o}function g(w,P){var E=v.get(w),R;return $(E)||(R=E.get(P)),$(R)&&(R=_(w,P),$(R)||($(E)&&(E=new x,v.set(w,E)),E.set(P,R))),R}function b(w){if($(w))throw new TypeError;return c===w||u===w||!$(d)&&d.has(w)}function y(w,P,E){if(!b(E))throw new Error("Metadata provider not registered.");var R=g(w,P);if(R!==E){if(!$(R))return!1;var H=v.get(w);$(H)&&(H=new x,v.set(w,H)),H.set(P,E)}return!0}}function Dr(){var o;return!$(z)&&D(n.Reflect)&&Object.isExtensible(n.Reflect)&&(o=n.Reflect[z]),$(o)&&(o=Ir()),!$(z)&&D(n.Reflect)&&Object.isExtensible(n.Reflect)&&Object.defineProperty(n.Reflect,z,{enumerable:!1,configurable:!1,writable:!1,value:o}),o}function Ur(o){var c=new C,u={isProviderFor:function(b,y){var w=c.get(b);return $(w)?!1:w.has(y)},OrdinaryDefineOwnMetadata:U,OrdinaryHasOwnMetadata:v,OrdinaryGetOwnMetadata:O,OrdinaryOwnMetadataKeys:_,OrdinaryDeleteMetadata:g};return L.registerProvider(u),u;function d(b,y,w){var P=c.get(b),E=!1;if($(P)){if(!w)return;P=new x,c.set(b,P),E=!0}var R=P.get(y);if($(R)){if(!w)return;if(R=new x,P.set(y,R),!o.setProvider(b,y,u))throw P.delete(y),E&&c.delete(b),new Error("Wrong provider for target.")}return R}function v(b,y,w){var P=d(y,w,!1);return $(P)?!1:kt(P.has(b))}function O(b,y,w){var P=d(y,w,!1);if(!$(P))return P.get(b)}function U(b,y,w,P){var E=d(w,P,!0);E.set(b,y)}function _(b,y){var w=[],P=d(b,y,!1);if($(P))return w;for(var E=P.keys(),R=_t(E),H=0;;){var Tt=Pt(R);if(!Tt)return w.length=H,w;var Fr=St(Tt);try{w[H]=Fr}catch(Nr){try{At(R)}finally{throw Nr}}H++}}function g(b,y,w){var P=d(y,w,!1);if($(P)||!P.delete(b))return!1;if(P.size===0){var E=c.get(y);$(E)||(E.delete(w),E.size===0&&c.delete(E))}return!0}}function zr(o){var c=o.defineMetadata,u=o.hasOwnMetadata,d=o.getOwnMetadata,v=o.getOwnMetadataKeys,O=o.deleteMetadata,U=new C,_={isProviderFor:function(g,b){var y=U.get(g);return!$(y)&&y.has(b)?!0:v(g,b).length?($(y)&&(y=new S,U.set(g,y)),y.add(b),!0):!1},OrdinaryDefineOwnMetadata:c,OrdinaryHasOwnMetadata:u,OrdinaryGetOwnMetadata:d,OrdinaryOwnMetadataKeys:v,OrdinaryDeleteMetadata:O};return _}function oe(o,c,u){var d=L.getProvider(o,c);if(!$(d))return d;if(u){if(L.setProvider(o,c,V))return V;throw new Error("Illegal state.")}}function jr(){var o={},c=[],u=function(){function _(g,b,y){this._index=0,this._keys=g,this._values=b,this._selector=y}return _.prototype["@@iterator"]=function(){return this},_.prototype[l]=function(){return this},_.prototype.next=function(){var g=this._index;if(g>=0&&g<this._keys.length){var b=this._selector(this._keys[g],this._values[g]);return g+1>=this._keys.length?(this._index=-1,this._keys=c,this._values=c):this._index++,{value:b,done:!1}}return{value:void 0,done:!0}},_.prototype.throw=function(g){throw this._index>=0&&(this._index=-1,this._keys=c,this._values=c),g},_.prototype.return=function(g){return this._index>=0&&(this._index=-1,this._keys=c,this._values=c),{value:g,done:!0}},_}(),d=function(){function _(){this._keys=[],this._values=[],this._cacheKey=o,this._cacheIndex=-2}return Object.defineProperty(_.prototype,"size",{get:function(){return this._keys.length},enumerable:!0,configurable:!0}),_.prototype.has=function(g){return this._find(g,!1)>=0},_.prototype.get=function(g){var b=this._find(g,!1);return b>=0?this._values[b]:void 0},_.prototype.set=function(g,b){var y=this._find(g,!0);return this._values[y]=b,this},_.prototype.delete=function(g){var b=this._find(g,!1);if(b>=0){for(var y=this._keys.length,w=b+1;w<y;w++)this._keys[w-1]=this._keys[w],this._values[w-1]=this._values[w];return this._keys.length--,this._values.length--,Le(g,this._cacheKey)&&(this._cacheKey=o,this._cacheIndex=-2),!0}return!1},_.prototype.clear=function(){this._keys.length=0,this._values.length=0,this._cacheKey=o,this._cacheIndex=-2},_.prototype.keys=function(){return new u(this._keys,this._values,v)},_.prototype.values=function(){return new u(this._keys,this._values,O)},_.prototype.entries=function(){return new u(this._keys,this._values,U)},_.prototype["@@iterator"]=function(){return this.entries()},_.prototype[l]=function(){return this.entries()},_.prototype._find=function(g,b){if(!Le(this._cacheKey,g)){this._cacheIndex=-1;for(var y=0;y<this._keys.length;y++)if(Le(this._keys[y],g)){this._cacheIndex=y;break}}return this._cacheIndex<0&&b&&(this._cacheIndex=this._keys.length,this._keys.push(g),this._values.push(void 0)),this._cacheIndex},_}();return d;function v(_,g){return _}function O(_,g){return g}function U(_,g){return[_,g]}}function Lr(){var o=function(){function c(){this._map=new x}return Object.defineProperty(c.prototype,"size",{get:function(){return this._map.size},enumerable:!0,configurable:!0}),c.prototype.has=function(u){return this._map.has(u)},c.prototype.add=function(u){return this._map.set(u,u),this},c.prototype.delete=function(u){return this._map.delete(u)},c.prototype.clear=function(){this._map.clear()},c.prototype.keys=function(){return this._map.keys()},c.prototype.values=function(){return this._map.keys()},c.prototype.entries=function(){return this._map.entries()},c.prototype["@@iterator"]=function(){return this.keys()},c.prototype[l]=function(){return this.keys()},c}();return o}function Hr(){var o=16,c=m.create(),u=d();return function(){function g(){this._key=d()}return g.prototype.has=function(b){var y=v(b,!1);return y!==void 0?m.has(y,this._key):!1},g.prototype.get=function(b){var y=v(b,!1);return y!==void 0?m.get(y,this._key):void 0},g.prototype.set=function(b,y){var w=v(b,!0);return w[this._key]=y,this},g.prototype.delete=function(b){var y=v(b,!1);return y!==void 0?delete y[this._key]:!1},g.prototype.clear=function(){this._key=d()},g}();function d(){var g;do g="@@WeakMap@@"+_();while(m.has(c,g));return c[g]=!0,g}function v(g,b){if(!r.call(g,u)){if(!b)return;Object.defineProperty(g,u,{value:m.create()})}return g[u]}function O(g,b){for(var y=0;y<b;++y)g[y]=Math.random()*255|0;return g}function U(g){if(typeof Uint8Array=="function"){var b=new Uint8Array(g);return typeof crypto<"u"?crypto.getRandomValues(b):typeof msCrypto<"u"?msCrypto.getRandomValues(b):O(b,g),b}return O(new Array(g),g)}function _(){var g=U(o);g[6]=g[6]&79|64,g[8]=g[8]&191|128;for(var b="",y=0;y<o;++y){var w=g[y];(y===4||y===6||y===8)&&(b+="-"),w<16&&(b+="0"),b+=w.toString(16).toLowerCase()}return b}}function Fe(o){return o.__=void 0,delete o.__,o}})}(s||(s={})),It}ss();const de={Singleton:0,Transient:2};class K{constructor(){this.services=new Map,this.singletonInstances=new Map,this.tokenRegistry=new Map}static getInstance(){return K.instance||(K.instance=new K),K.instance}addService(e,t,n){this.services.set(e,{token:e,implementation:t,lifetime:n}),n===de.Singleton&&(this.singletonInstances.has(e)||this.singletonInstances.set(e,new t))}getOrCreateToken(e){const t=e.name;return this.tokenRegistry.has(t)||this.tokenRegistry.set(t,Symbol(t)),this.tokenRegistry.get(t)}getService(e){const t=this.services.get(e);if(!t)throw new Error(`Service not registered for token: ${e.toString()}`);switch(t.lifetime){case de.Singleton:return this.getSingletonInstance(t);case de.Transient:return new t.implementation;default:throw new Error(`Unsupported lifetime: ${t.lifetime}`)}}getSingletonInstance(e){return this.singletonInstances.has(e.token)||this.singletonInstances.set(e.token,new e.implementation),this.singletonInstances.get(e.token)}}function ns(s=de.Singleton){return function(e){const t=K.getInstance(),n=t.getOrCreateToken(e);return t.addService(n,e,s),e}}function is(s){return function(e,t){const n=s||Reflect.getMetadata("design:type",e,t);if(!n)throw new Error(`Cannot resolve type for property '${t}'. Make sure emitDecoratorMetadata is enabled.`);const r=K.getInstance(),i=r.getOrCreateToken(n);Object.defineProperty(e,t,{get:function(){return r.getService(i)},enumerable:!0,configurable:!0})}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ke=globalThis,Pe=Ke.trustedTypes,Ut=Pe?Pe.createPolicy("lit-html",{createHTML:s=>s}):void 0,rr="$lit$",W=`lit$${Math.random().toFixed(9).slice(2)}$`,sr="?"+W,as=`<${sr}>`,J=document,ge=()=>J.createComment(""),me=s=>s===null||typeof s!="object"&&typeof s!="function",Xe=Array.isArray,ls=s=>Xe(s)||typeof s?.[Symbol.iterator]=="function",Ne=`[ 	
\f\r]`,ce=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,zt=/-->/g,jt=/>/g,Q=RegExp(`>|${Ne}(?:([^\\s"'>=/]+)(${Ne}*=${Ne}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Lt=/'/g,Ht=/"/g,nr=/^(?:script|style|textarea|title)$/i,os=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),M=os(1),ee=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),Ft=new WeakMap,X=J.createTreeWalker(J,129);function ir(s,e){if(!Xe(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ut!==void 0?Ut.createHTML(e):e}const cs=(s,e)=>{const t=s.length-1,n=[];let r,i=e===2?"<svg>":e===3?"<math>":"",a=ce;for(let l=0;l<t;l++){const h=s[l];let p,f,m=-1,k=0;for(;k<h.length&&(a.lastIndex=k,f=a.exec(h),f!==null);)k=a.lastIndex,a===ce?f[1]==="!--"?a=zt:f[1]!==void 0?a=jt:f[2]!==void 0?(nr.test(f[2])&&(r=RegExp("</"+f[2],"g")),a=Q):f[3]!==void 0&&(a=Q):a===Q?f[0]===">"?(a=r??ce,m=-1):f[1]===void 0?m=-2:(m=a.lastIndex-f[2].length,p=f[1],a=f[3]===void 0?Q:f[3]==='"'?Ht:Lt):a===Ht||a===Lt?a=Q:a===zt||a===jt?a=ce:(a=Q,r=void 0);const x=a===Q&&s[l+1].startsWith("/>")?" ":"";i+=a===ce?h+as:m>=0?(n.push(p),h.slice(0,m)+rr+h.slice(m)+W+x):h+W+(m===-2?l:x)}return[ir(s,i+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};let qe=class ar{constructor({strings:e,_$litType$:t},n){let r;this.parts=[];let i=0,a=0;const l=e.length-1,h=this.parts,[p,f]=cs(e,t);if(this.el=ar.createElement(p,n),X.currentNode=this.el.content,t===2||t===3){const m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(r=X.nextNode())!==null&&h.length<l;){if(r.nodeType===1){if(r.hasAttributes())for(const m of r.getAttributeNames())if(m.endsWith(rr)){const k=f[a++],x=r.getAttribute(m).split(W),S=/([.?@])?(.*)/.exec(k);h.push({type:1,index:i,name:S[2],strings:x,ctor:S[1]==="."?us:S[1]==="?"?ps:S[1]==="@"?ds:Me}),r.removeAttribute(m)}else m.startsWith(W)&&(h.push({type:6,index:i}),r.removeAttribute(m));if(nr.test(r.tagName)){const m=r.textContent.split(W),k=m.length-1;if(k>0){r.textContent=Pe?Pe.emptyScript:"";for(let x=0;x<k;x++)r.append(m[x],ge()),X.nextNode(),h.push({type:2,index:++i});r.append(m[k],ge())}}}else if(r.nodeType===8)if(r.data===sr)h.push({type:2,index:i});else{let m=-1;for(;(m=r.data.indexOf(W,m+1))!==-1;)h.push({type:7,index:i}),m+=W.length-1}i++}}static createElement(e,t){const n=J.createElement("template");return n.innerHTML=e,n}};function ae(s,e,t=s,n){if(e===ee)return e;let r=n!==void 0?t._$Co?.[n]:t._$Cl;const i=me(e)?void 0:e._$litDirective$;return r?.constructor!==i&&(r?._$AO?.(!1),i===void 0?r=void 0:(r=new i(s),r._$AT(s,t,n)),n!==void 0?(t._$Co??=[])[n]=r:t._$Cl=r),r!==void 0&&(e=ae(s,r._$AS(s,e.values),r,n)),e}let hs=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??J).importNode(t,!0);X.currentNode=r;let i=X.nextNode(),a=0,l=0,h=n[0];for(;h!==void 0;){if(a===h.index){let p;h.type===2?p=new Je(i,i.nextSibling,this,e):h.type===1?p=new h.ctor(i,h.name,h.strings,this,e):h.type===6&&(p=new fs(i,this,e)),this._$AV.push(p),h=n[++l]}a!==h?.index&&(i=X.nextNode(),a++)}return X.currentNode=J,r}p(e){let t=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},Je=class lr{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ae(this,e,t),me(e)?e===I||e==null||e===""?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==ee&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ls(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&me(this._$AH)?this._$AA.nextSibling.data=e:this.T(J.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,r=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=qe.createElement(ir(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{const i=new hs(r,this),a=i.u(this.options);i.p(t),this.T(a),this._$AH=i}}_$AC(e){let t=Ft.get(e.strings);return t===void 0&&Ft.set(e.strings,t=new qe(e)),t}k(e){Xe(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,r=0;for(const i of e)r===t.length?t.push(n=new lr(this.O(ge()),this.O(ge()),this,this.options)):n=t[r],n._$AI(i),r++;r<t.length&&(this._$AR(n&&n._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const n=e.nextSibling;e.remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Me=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=I}_$AI(e,t=this,n,r){const i=this.strings;let a=!1;if(i===void 0)e=ae(this,e,t,0),a=!me(e)||e!==this._$AH&&e!==ee,a&&(this._$AH=e);else{const l=e;let h,p;for(e=i[0],h=0;h<i.length-1;h++)p=ae(this,l[n+h],t,h),p===ee&&(p=this._$AH[h]),a||=!me(p)||p!==this._$AH[h],p===I?e=I:e!==I&&(e+=(p??"")+i[h+1]),this._$AH[h]=p}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},us=class extends Me{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}},ps=class extends Me{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}},ds=class extends Me{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=ae(this,e,t,0)??I)===ee)return;const n=this._$AH,r=e===I&&n!==I||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==I&&(n===I||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},fs=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){ae(this,e)}};const gs=Ke.litHtmlPolyfillSupport;gs?.(qe,Je),(Ke.litHtmlVersions??=[]).push("3.3.1");const ms=(s,e,t)=>{const n=t?.renderBefore??e;let r=n._$litPart$;if(r===void 0){const i=t?.renderBefore??null;n._$litPart$=r=new Je(e.insertBefore(ge(),i),i,void 0,t??{})}return r._$AI(s),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const et=globalThis;let ie=class extends ne{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ms(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ee}};ie._$litElement$=!0,ie.finalized=!0,et.litElementHydrateSupport?.({LitElement:ie});const bs=et.litElementPolyfillSupport;bs?.({LitElement:ie});(et.litElementVersions??=[]).push("4.2.1");var ys=Object.defineProperty,ws=Object.getOwnPropertyDescriptor,tt=(s,e,t,n)=>{for(var r=n>1?void 0:n?ws(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=(n?a(e,t,r):a(r))||r);return n&&r&&ys(e,t,r),r};let Ae=class extends ie{constructor(){super(...arguments),this.currentPath="",this.handleNavigation=()=>{const s=window.location.hash;let e=s?s.substring(1):"";e.startsWith("/")||(e="/"+e),this.currentPath=e,this.requestUpdate()}}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleNavigation),this.handleNavigation()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleNavigation)}createRenderRoot(){return this}render(){for(const[s,e]of or.entries()){const t=new RegExp("^"+s.replace(/:[^\s/]+/g,"([\\w-]+)")+"$"),n=this.currentPath.match(t);if(n){const r=n.slice(1),i=new e;return i.routeParams=r,this.renderContentWithLayout(()=>M`<div>${i}</div>`)}}return this.renderContentWithLayout(()=>M`<h1>404 Not Found</h1>`)}renderContentWithLayout(s){if(!this.defaultLayout)return s();const e=new this.defaultLayout;return e.body=s(),M`
            <div>${e}</div>
        `}};tt([Re({attribute:!1})],Ae.prototype,"defaultLayout",2);tt([rs()],Ae.prototype,"currentPath",2);Ae=tt([Z("router-outlet")],Ae);const or=new Map;function Ie(s){return function(e){return or.set(s,e),e}}const pt=class pt extends ie{createRenderRoot(){return this.constructor.useShadowDom?super.createRenderRoot():this}};pt.useShadowDom=!1;let F=pt;class ks extends F{}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const vs={CHILD:2},$s=s=>(...e)=>({_$litDirective$:s,values:e});class xs{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class Be extends xs{constructor(e){if(super(e),this.it=I,e.type!==vs.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===I||e==null)return this._t=void 0,this.it=e;if(e===ee)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Be.directiveName="unsafeHTML",Be.resultType=1;const _s=$s(Be);function rt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var re=rt();function cr(s){re=s}var fe={exec:()=>null};function A(s,e=""){let t=typeof s=="string"?s:s.source,n={replace:(r,i)=>{let a=typeof i=="string"?i:i.source;return a=a.replace(j.caret,"$1"),t=t.replace(r,a),n},getRegex:()=>new RegExp(t,e)};return n}var j={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:s=>new RegExp(`^( {0,3}${s})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}#`),htmlBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}<(?:[a-z].*>|!--)`,"i")},Ss=/^(?:[ \t]*(?:\n|$))+/,Ps=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,As=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,ye=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Ts=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,st=/(?:[*+-]|\d{1,9}[.)])/,hr=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,ur=A(hr).replace(/bull/g,st).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Es=A(hr).replace(/bull/g,st).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),nt=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Cs=/^[^\n]+/,it=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Os=A(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",it).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Rs=A(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,st).getRegex(),De="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",at=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Ms=A("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",at).replace("tag",De).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),pr=A(nt).replace("hr",ye).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",De).getRegex(),Is=A(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",pr).getRegex(),lt={blockquote:Is,code:Ps,def:Os,fences:As,heading:Ts,hr:ye,html:Ms,lheading:ur,list:Rs,newline:Ss,paragraph:pr,table:fe,text:Cs},Nt=A("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",ye).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",De).getRegex(),Ds={...lt,lheading:Es,table:Nt,paragraph:A(nt).replace("hr",ye).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Nt).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",De).getRegex()},Us={...lt,html:A(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",at).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:fe,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:A(nt).replace("hr",ye).replace("heading",` *#{1,6} *[^
]`).replace("lheading",ur).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},zs=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,js=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,dr=/^( {2,}|\\)\n(?!\s*$)/,Ls=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Ue=/[\p{P}\p{S}]/u,ot=/[\s\p{P}\p{S}]/u,fr=/[^\s\p{P}\p{S}]/u,Hs=A(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,ot).getRegex(),gr=/(?!~)[\p{P}\p{S}]/u,Fs=/(?!~)[\s\p{P}\p{S}]/u,Ns=/(?:[^\s\p{P}\p{S}]|~)/u,qs=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,mr=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,Bs=A(mr,"u").replace(/punct/g,Ue).getRegex(),Gs=A(mr,"u").replace(/punct/g,gr).getRegex(),br="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Zs=A(br,"gu").replace(/notPunctSpace/g,fr).replace(/punctSpace/g,ot).replace(/punct/g,Ue).getRegex(),Ws=A(br,"gu").replace(/notPunctSpace/g,Ns).replace(/punctSpace/g,Fs).replace(/punct/g,gr).getRegex(),Vs=A("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,fr).replace(/punctSpace/g,ot).replace(/punct/g,Ue).getRegex(),Ys=A(/\\(punct)/,"gu").replace(/punct/g,Ue).getRegex(),Qs=A(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Ks=A(at).replace("(?:-->|$)","-->").getRegex(),Xs=A("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Ks).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Te=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,Js=A(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",Te).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),yr=A(/^!?\[(label)\]\[(ref)\]/).replace("label",Te).replace("ref",it).getRegex(),wr=A(/^!?\[(ref)\](?:\[\])?/).replace("ref",it).getRegex(),en=A("reflink|nolink(?!\\()","g").replace("reflink",yr).replace("nolink",wr).getRegex(),ct={_backpedal:fe,anyPunctuation:Ys,autolink:Qs,blockSkip:qs,br:dr,code:js,del:fe,emStrongLDelim:Bs,emStrongRDelimAst:Zs,emStrongRDelimUnd:Vs,escape:zs,link:Js,nolink:wr,punctuation:Hs,reflink:yr,reflinkSearch:en,tag:Xs,text:Ls,url:fe},tn={...ct,link:A(/^!?\[(label)\]\((.*?)\)/).replace("label",Te).getRegex(),reflink:A(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Te).getRegex()},Ge={...ct,emStrongRDelimAst:Ws,emStrongLDelim:Gs,url:A(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},rn={...Ge,br:A(dr).replace("{2,}","*").getRegex(),text:A(Ge.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},$e={normal:lt,gfm:Ds,pedantic:Us},he={normal:ct,gfm:Ge,breaks:rn,pedantic:tn},sn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},qt=s=>sn[s];function q(s,e){if(e){if(j.escapeTest.test(s))return s.replace(j.escapeReplace,qt)}else if(j.escapeTestNoEncode.test(s))return s.replace(j.escapeReplaceNoEncode,qt);return s}function Bt(s){try{s=encodeURI(s).replace(j.percentDecode,"%")}catch{return null}return s}function Gt(s,e){let t=s.replace(j.findPipe,(i,a,l)=>{let h=!1,p=a;for(;--p>=0&&l[p]==="\\";)h=!h;return h?"|":" |"}),n=t.split(j.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;r<n.length;r++)n[r]=n[r].trim().replace(j.slashPipe,"|");return n}function ue(s,e,t){let n=s.length;if(n===0)return"";let r=0;for(;r<n&&s.charAt(n-r-1)===e;)r++;return s.slice(0,n-r)}function nn(s,e){if(s.indexOf(e[1])===-1)return-1;let t=0;for(let n=0;n<s.length;n++)if(s[n]==="\\")n++;else if(s[n]===e[0])t++;else if(s[n]===e[1]&&(t--,t<0))return n;return t>0?-2:-1}function Zt(s,e,t,n,r){let i=e.href,a=e.title||null,l=s[1].replace(r.other.outputLinkReplace,"$1");n.state.inLink=!0;let h={type:s[0].charAt(0)==="!"?"image":"link",raw:t,href:i,title:a,text:l,tokens:n.inlineTokens(l)};return n.state.inLink=!1,h}function an(s,e,t){let n=s.match(t.other.indentCodeCompensation);if(n===null)return e;let r=n[1];return e.split(`
`).map(i=>{let a=i.match(t.other.beginningSpace);if(a===null)return i;let[l]=a;return l.length>=r.length?i.slice(r.length):i}).join(`
`)}var Ee=class{options;rules;lexer;constructor(s){this.options=s||re}space(s){let e=this.rules.block.newline.exec(s);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(s){let e=this.rules.block.code.exec(s);if(e){let t=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?t:ue(t,`
`)}}}fences(s){let e=this.rules.block.fences.exec(s);if(e){let t=e[0],n=an(t,e[3]||"",this.rules);return{type:"code",raw:t,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:n}}}heading(s){let e=this.rules.block.heading.exec(s);if(e){let t=e[2].trim();if(this.rules.other.endingHash.test(t)){let n=ue(t,"#");(this.options.pedantic||!n||this.rules.other.endingSpaceChar.test(n))&&(t=n.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(s){let e=this.rules.block.hr.exec(s);if(e)return{type:"hr",raw:ue(e[0],`
`)}}blockquote(s){let e=this.rules.block.blockquote.exec(s);if(e){let t=ue(e[0],`
`).split(`
`),n="",r="",i=[];for(;t.length>0;){let a=!1,l=[],h;for(h=0;h<t.length;h++)if(this.rules.other.blockquoteStart.test(t[h]))l.push(t[h]),a=!0;else if(!a)l.push(t[h]);else break;t=t.slice(h);let p=l.join(`
`),f=p.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");n=n?`${n}
${p}`:p,r=r?`${r}
${f}`:f;let m=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(f,i,!0),this.lexer.state.top=m,t.length===0)break;let k=i.at(-1);if(k?.type==="code")break;if(k?.type==="blockquote"){let x=k,S=x.raw+`
`+t.join(`
`),C=this.blockquote(S);i[i.length-1]=C,n=n.substring(0,n.length-x.raw.length)+C.raw,r=r.substring(0,r.length-x.text.length)+C.text;break}else if(k?.type==="list"){let x=k,S=x.raw+`
`+t.join(`
`),C=this.list(S);i[i.length-1]=C,n=n.substring(0,n.length-k.raw.length)+C.raw,r=r.substring(0,r.length-x.raw.length)+C.raw,t=S.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:n,tokens:i,text:r}}}list(s){let e=this.rules.block.list.exec(s);if(e){let t=e[1].trim(),n=t.length>1,r={type:"list",raw:"",ordered:n,start:n?+t.slice(0,-1):"",loose:!1,items:[]};t=n?`\\d{1,9}\\${t.slice(-1)}`:`\\${t}`,this.options.pedantic&&(t=n?t:"[*+-]");let i=this.rules.other.listItemRegex(t),a=!1;for(;s;){let h=!1,p="",f="";if(!(e=i.exec(s))||this.rules.block.hr.test(s))break;p=e[0],s=s.substring(p.length);let m=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,L=>" ".repeat(3*L.length)),k=s.split(`
`,1)[0],x=!m.trim(),S=0;if(this.options.pedantic?(S=2,f=m.trimStart()):x?S=e[1].length+1:(S=e[2].search(this.rules.other.nonSpaceChar),S=S>4?1:S,f=m.slice(S),S+=e[1].length),x&&this.rules.other.blankLine.test(k)&&(p+=k+`
`,s=s.substring(k.length+1),h=!0),!h){let L=this.rules.other.nextBulletRegex(S),V=this.rules.other.hrRegex(S),we=this.rules.other.fencesBeginRegex(S),ke=this.rules.other.headingBeginRegex(S),ze=this.rules.other.htmlBeginRegex(S);for(;s;){let le=s.split(`
`,1)[0],Y;if(k=le,this.options.pedantic?(k=k.replace(this.rules.other.listReplaceNesting,"  "),Y=k):Y=k.replace(this.rules.other.tabCharGlobal,"    "),we.test(k)||ke.test(k)||ze.test(k)||L.test(k)||V.test(k))break;if(Y.search(this.rules.other.nonSpaceChar)>=S||!k.trim())f+=`
`+Y.slice(S);else{if(x||m.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||we.test(m)||ke.test(m)||V.test(m))break;f+=`
`+k}!x&&!k.trim()&&(x=!0),p+=le+`
`,s=s.substring(le.length+1),m=Y.slice(S)}}r.loose||(a?r.loose=!0:this.rules.other.doubleBlankLine.test(p)&&(a=!0));let C=null,z;this.options.gfm&&(C=this.rules.other.listIsTask.exec(f),C&&(z=C[0]!=="[ ] ",f=f.replace(this.rules.other.listReplaceTask,""))),r.items.push({type:"list_item",raw:p,task:!!C,checked:z,loose:!1,text:f,tokens:[]}),r.raw+=p}let l=r.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;r.raw=r.raw.trimEnd();for(let h=0;h<r.items.length;h++)if(this.lexer.state.top=!1,r.items[h].tokens=this.lexer.blockTokens(r.items[h].text,[]),!r.loose){let p=r.items[h].tokens.filter(m=>m.type==="space"),f=p.length>0&&p.some(m=>this.rules.other.anyLine.test(m.raw));r.loose=f}if(r.loose)for(let h=0;h<r.items.length;h++)r.items[h].loose=!0;return r}}html(s){let e=this.rules.block.html.exec(s);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(s){let e=this.rules.block.def.exec(s);if(e){let t=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),n=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",r=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:t,raw:e[0],href:n,title:r}}}table(s){let e=this.rules.block.table.exec(s);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let t=Gt(e[1]),n=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),r=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],i={type:"table",raw:e[0],header:[],align:[],rows:[]};if(t.length===n.length){for(let a of n)this.rules.other.tableAlignRight.test(a)?i.align.push("right"):this.rules.other.tableAlignCenter.test(a)?i.align.push("center"):this.rules.other.tableAlignLeft.test(a)?i.align.push("left"):i.align.push(null);for(let a=0;a<t.length;a++)i.header.push({text:t[a],tokens:this.lexer.inline(t[a]),header:!0,align:i.align[a]});for(let a of r)i.rows.push(Gt(a,i.header.length).map((l,h)=>({text:l,tokens:this.lexer.inline(l),header:!1,align:i.align[h]})));return i}}lheading(s){let e=this.rules.block.lheading.exec(s);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(s){let e=this.rules.block.paragraph.exec(s);if(e){let t=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}}}text(s){let e=this.rules.block.text.exec(s);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(s){let e=this.rules.inline.escape.exec(s);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(s){let e=this.rules.inline.tag.exec(s);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(s){let e=this.rules.inline.link.exec(s);if(e){let t=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(t)){if(!this.rules.other.endAngleBracket.test(t))return;let i=ue(t.slice(0,-1),"\\");if((t.length-i.length)%2===0)return}else{let i=nn(e[2],"()");if(i===-2)return;if(i>-1){let a=(e[0].indexOf("!")===0?5:4)+e[1].length+i;e[2]=e[2].substring(0,i),e[0]=e[0].substring(0,a).trim(),e[3]=""}}let n=e[2],r="";if(this.options.pedantic){let i=this.rules.other.pedanticHrefTitle.exec(n);i&&(n=i[1],r=i[3])}else r=e[3]?e[3].slice(1,-1):"";return n=n.trim(),this.rules.other.startAngleBracket.test(n)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(t)?n=n.slice(1):n=n.slice(1,-1)),Zt(e,{href:n&&n.replace(this.rules.inline.anyPunctuation,"$1"),title:r&&r.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(s,e){let t;if((t=this.rules.inline.reflink.exec(s))||(t=this.rules.inline.nolink.exec(s))){let n=(t[2]||t[1]).replace(this.rules.other.multipleSpaceGlobal," "),r=e[n.toLowerCase()];if(!r){let i=t[0].charAt(0);return{type:"text",raw:i,text:i}}return Zt(t,r,t[0],this.lexer,this.rules)}}emStrong(s,e,t=""){let n=this.rules.inline.emStrongLDelim.exec(s);if(!(!n||n[3]&&t.match(this.rules.other.unicodeAlphaNumeric))&&(!(n[1]||n[2])||!t||this.rules.inline.punctuation.exec(t))){let r=[...n[0]].length-1,i,a,l=r,h=0,p=n[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(p.lastIndex=0,e=e.slice(-1*s.length+r);(n=p.exec(e))!=null;){if(i=n[1]||n[2]||n[3]||n[4]||n[5]||n[6],!i)continue;if(a=[...i].length,n[3]||n[4]){l+=a;continue}else if((n[5]||n[6])&&r%3&&!((r+a)%3)){h+=a;continue}if(l-=a,l>0)continue;a=Math.min(a,a+l+h);let f=[...n[0]][0].length,m=s.slice(0,r+n.index+f+a);if(Math.min(r,a)%2){let x=m.slice(1,-1);return{type:"em",raw:m,text:x,tokens:this.lexer.inlineTokens(x)}}let k=m.slice(2,-2);return{type:"strong",raw:m,text:k,tokens:this.lexer.inlineTokens(k)}}}}codespan(s){let e=this.rules.inline.code.exec(s);if(e){let t=e[2].replace(this.rules.other.newLineCharGlobal," "),n=this.rules.other.nonSpaceChar.test(t),r=this.rules.other.startingSpaceChar.test(t)&&this.rules.other.endingSpaceChar.test(t);return n&&r&&(t=t.substring(1,t.length-1)),{type:"codespan",raw:e[0],text:t}}}br(s){let e=this.rules.inline.br.exec(s);if(e)return{type:"br",raw:e[0]}}del(s){let e=this.rules.inline.del.exec(s);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(s){let e=this.rules.inline.autolink.exec(s);if(e){let t,n;return e[2]==="@"?(t=e[1],n="mailto:"+t):(t=e[1],n=t),{type:"link",raw:e[0],text:t,href:n,tokens:[{type:"text",raw:t,text:t}]}}}url(s){let e;if(e=this.rules.inline.url.exec(s)){let t,n;if(e[2]==="@")t=e[0],n="mailto:"+t;else{let r;do r=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(r!==e[0]);t=e[0],e[1]==="www."?n="http://"+e[0]:n=e[0]}return{type:"link",raw:e[0],text:t,href:n,tokens:[{type:"text",raw:t,text:t}]}}}inlineText(s){let e=this.rules.inline.text.exec(s);if(e){let t=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:t}}}},B=class Ze{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||re,this.options.tokenizer=this.options.tokenizer||new Ee,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:j,block:$e.normal,inline:he.normal};this.options.pedantic?(t.block=$e.pedantic,t.inline=he.pedantic):this.options.gfm&&(t.block=$e.gfm,this.options.breaks?t.inline=he.breaks:t.inline=he.gfm),this.tokenizer.rules=t}static get rules(){return{block:$e,inline:he}}static lex(e,t){return new Ze(t).lex(e)}static lexInline(e,t){return new Ze(t).inlineTokens(e)}lex(e){e=e.replace(j.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let n=this.inlineQueue[t];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){for(this.options.pedantic&&(e=e.replace(j.tabCharGlobal,"    ").replace(j.spaceLine,""));e;){let r;if(this.options.extensions?.block?.some(a=>(r=a.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let a=t.at(-1);r.raw.length===1&&a!==void 0?a.raw+=`
`:t.push(r);continue}if(r=this.tokenizer.code(e)){e=e.substring(r.raw.length);let a=t.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+r.raw,a.text+=`
`+r.text,this.inlineQueue.at(-1).src=a.text):t.push(r);continue}if(r=this.tokenizer.fences(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.heading(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.hr(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.blockquote(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.list(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.html(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(e)){e=e.substring(r.raw.length);let a=t.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+r.raw,a.text+=`
`+r.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title});continue}if(r=this.tokenizer.table(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.lheading(e)){e=e.substring(r.raw.length),t.push(r);continue}let i=e;if(this.options.extensions?.startBlock){let a=1/0,l=e.slice(1),h;this.options.extensions.startBlock.forEach(p=>{h=p.call({lexer:this},l),typeof h=="number"&&h>=0&&(a=Math.min(a,h))}),a<1/0&&a>=0&&(i=e.substring(0,a+1))}if(this.state.top&&(r=this.tokenizer.paragraph(i))){let a=t.at(-1);n&&a?.type==="paragraph"?(a.raw+=`
`+r.raw,a.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):t.push(r),n=i.length!==e.length,e=e.substring(r.raw.length);continue}if(r=this.tokenizer.text(e)){e=e.substring(r.raw.length);let a=t.at(-1);a?.type==="text"?(a.raw+=`
`+r.raw,a.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):t.push(r);continue}if(e){let a="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(a);break}else throw new Error(a)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n=e,r=null;if(this.tokens.links){let l=Object.keys(this.tokens.links);if(l.length>0)for(;(r=this.tokenizer.rules.inline.reflinkSearch.exec(n))!=null;)l.includes(r[0].slice(r[0].lastIndexOf("[")+1,-1))&&(n=n.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(r=this.tokenizer.rules.inline.anyPunctuation.exec(n))!=null;)n=n.slice(0,r.index)+"++"+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(r=this.tokenizer.rules.inline.blockSkip.exec(n))!=null;)n=n.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let i=!1,a="";for(;e;){i||(a=""),i=!1;let l;if(this.options.extensions?.inline?.some(p=>(l=p.call({lexer:this},e,t))?(e=e.substring(l.raw.length),t.push(l),!0):!1))continue;if(l=this.tokenizer.escape(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.tag(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.link(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(l.raw.length);let p=t.at(-1);l.type==="text"&&p?.type==="text"?(p.raw+=l.raw,p.text+=l.text):t.push(l);continue}if(l=this.tokenizer.emStrong(e,n,a)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.codespan(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.br(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.del(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.autolink(e)){e=e.substring(l.raw.length),t.push(l);continue}if(!this.state.inLink&&(l=this.tokenizer.url(e))){e=e.substring(l.raw.length),t.push(l);continue}let h=e;if(this.options.extensions?.startInline){let p=1/0,f=e.slice(1),m;this.options.extensions.startInline.forEach(k=>{m=k.call({lexer:this},f),typeof m=="number"&&m>=0&&(p=Math.min(p,m))}),p<1/0&&p>=0&&(h=e.substring(0,p+1))}if(l=this.tokenizer.inlineText(h)){e=e.substring(l.raw.length),l.raw.slice(-1)!=="_"&&(a=l.raw.slice(-1)),i=!0;let p=t.at(-1);p?.type==="text"?(p.raw+=l.raw,p.text+=l.text):t.push(l);continue}if(e){let p="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(p);break}else throw new Error(p)}}return t}},Ce=class{options;parser;constructor(s){this.options=s||re}space(s){return""}code({text:s,lang:e,escaped:t}){let n=(e||"").match(j.notSpaceStart)?.[0],r=s.replace(j.endingNewline,"")+`
`;return n?'<pre><code class="language-'+q(n)+'">'+(t?r:q(r,!0))+`</code></pre>
`:"<pre><code>"+(t?r:q(r,!0))+`</code></pre>
`}blockquote({tokens:s}){return`<blockquote>
${this.parser.parse(s)}</blockquote>
`}html({text:s}){return s}heading({tokens:s,depth:e}){return`<h${e}>${this.parser.parseInline(s)}</h${e}>
`}hr(s){return`<hr>
`}list(s){let e=s.ordered,t=s.start,n="";for(let a=0;a<s.items.length;a++){let l=s.items[a];n+=this.listitem(l)}let r=e?"ol":"ul",i=e&&t!==1?' start="'+t+'"':"";return"<"+r+i+`>
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
`}strong({tokens:s}){return`<strong>${this.parser.parseInline(s)}</strong>`}em({tokens:s}){return`<em>${this.parser.parseInline(s)}</em>`}codespan({text:s}){return`<code>${q(s,!0)}</code>`}br(s){return"<br>"}del({tokens:s}){return`<del>${this.parser.parseInline(s)}</del>`}link({href:s,title:e,tokens:t}){let n=this.parser.parseInline(t),r=Bt(s);if(r===null)return n;s=r;let i='<a href="'+s+'"';return e&&(i+=' title="'+q(e)+'"'),i+=">"+n+"</a>",i}image({href:s,title:e,text:t,tokens:n}){n&&(t=this.parser.parseInline(n,this.parser.textRenderer));let r=Bt(s);if(r===null)return q(t);s=r;let i=`<img src="${s}" alt="${t}"`;return e&&(i+=` title="${q(e)}"`),i+=">",i}text(s){return"tokens"in s&&s.tokens?this.parser.parseInline(s.tokens):"escaped"in s&&s.escaped?s.text:q(s.text)}},ht=class{strong({text:s}){return s}em({text:s}){return s}codespan({text:s}){return s}del({text:s}){return s}html({text:s}){return s}text({text:s}){return s}link({text:s}){return""+s}image({text:s}){return""+s}br(){return""}},G=class We{options;renderer;textRenderer;constructor(e){this.options=e||re,this.options.renderer=this.options.renderer||new Ce,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new ht}static parse(e,t){return new We(t).parse(e)}static parseInline(e,t){return new We(t).parseInline(e)}parse(e,t=!0){let n="";for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let l=i,h=this.options.extensions.renderers[l.type].call({parser:this},l);if(h!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(l.type)){n+=h||"";continue}}let a=i;switch(a.type){case"space":{n+=this.renderer.space(a);continue}case"hr":{n+=this.renderer.hr(a);continue}case"heading":{n+=this.renderer.heading(a);continue}case"code":{n+=this.renderer.code(a);continue}case"table":{n+=this.renderer.table(a);continue}case"blockquote":{n+=this.renderer.blockquote(a);continue}case"list":{n+=this.renderer.list(a);continue}case"html":{n+=this.renderer.html(a);continue}case"paragraph":{n+=this.renderer.paragraph(a);continue}case"text":{let l=a,h=this.renderer.text(l);for(;r+1<e.length&&e[r+1].type==="text";)l=e[++r],h+=`
`+this.renderer.text(l);t?n+=this.renderer.paragraph({type:"paragraph",raw:h,text:h,tokens:[{type:"text",raw:h,text:h,escaped:!0}]}):n+=h;continue}default:{let l='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return n}parseInline(e,t=this.renderer){let n="";for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let l=this.options.extensions.renderers[i.type].call({parser:this},i);if(l!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){n+=l||"";continue}}let a=i;switch(a.type){case"escape":{n+=t.text(a);break}case"html":{n+=t.html(a);break}case"link":{n+=t.link(a);break}case"image":{n+=t.image(a);break}case"strong":{n+=t.strong(a);break}case"em":{n+=t.em(a);break}case"codespan":{n+=t.codespan(a);break}case"br":{n+=t.br(a);break}case"del":{n+=t.del(a);break}case"text":{n+=t.text(a);break}default:{let l='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return n}},_e=class{options;block;constructor(s){this.options=s||re}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(s){return s}postprocess(s){return s}processAllTokens(s){return s}provideLexer(){return this.block?B.lex:B.lexInline}provideParser(){return this.block?G.parse:G.parseInline}},ln=class{defaults=rt();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=G;Renderer=Ce;TextRenderer=ht;Lexer=B;Tokenizer=Ee;Hooks=_e;constructor(...s){this.use(...s)}walkTokens(s,e){let t=[];for(let n of s)switch(t=t.concat(e.call(this,n)),n.type){case"table":{let r=n;for(let i of r.header)t=t.concat(this.walkTokens(i.tokens,e));for(let i of r.rows)for(let a of i)t=t.concat(this.walkTokens(a.tokens,e));break}case"list":{let r=n;t=t.concat(this.walkTokens(r.items,e));break}default:{let r=n;this.defaults.extensions?.childTokens?.[r.type]?this.defaults.extensions.childTokens[r.type].forEach(i=>{let a=r[i].flat(1/0);t=t.concat(this.walkTokens(a,e))}):r.tokens&&(t=t.concat(this.walkTokens(r.tokens,e)))}}return t}use(...s){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return s.forEach(t=>{let n={...t};if(n.async=this.defaults.async||n.async||!1,t.extensions&&(t.extensions.forEach(r=>{if(!r.name)throw new Error("extension name required");if("renderer"in r){let i=e.renderers[r.name];i?e.renderers[r.name]=function(...a){let l=r.renderer.apply(this,a);return l===!1&&(l=i.apply(this,a)),l}:e.renderers[r.name]=r.renderer}if("tokenizer"in r){if(!r.level||r.level!=="block"&&r.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let i=e[r.level];i?i.unshift(r.tokenizer):e[r.level]=[r.tokenizer],r.start&&(r.level==="block"?e.startBlock?e.startBlock.push(r.start):e.startBlock=[r.start]:r.level==="inline"&&(e.startInline?e.startInline.push(r.start):e.startInline=[r.start]))}"childTokens"in r&&r.childTokens&&(e.childTokens[r.name]=r.childTokens)}),n.extensions=e),t.renderer){let r=this.defaults.renderer||new Ce(this.defaults);for(let i in t.renderer){if(!(i in r))throw new Error(`renderer '${i}' does not exist`);if(["options","parser"].includes(i))continue;let a=i,l=t.renderer[a],h=r[a];r[a]=(...p)=>{let f=l.apply(r,p);return f===!1&&(f=h.apply(r,p)),f||""}}n.renderer=r}if(t.tokenizer){let r=this.defaults.tokenizer||new Ee(this.defaults);for(let i in t.tokenizer){if(!(i in r))throw new Error(`tokenizer '${i}' does not exist`);if(["options","rules","lexer"].includes(i))continue;let a=i,l=t.tokenizer[a],h=r[a];r[a]=(...p)=>{let f=l.apply(r,p);return f===!1&&(f=h.apply(r,p)),f}}n.tokenizer=r}if(t.hooks){let r=this.defaults.hooks||new _e;for(let i in t.hooks){if(!(i in r))throw new Error(`hook '${i}' does not exist`);if(["options","block"].includes(i))continue;let a=i,l=t.hooks[a],h=r[a];_e.passThroughHooks.has(i)?r[a]=p=>{if(this.defaults.async)return Promise.resolve(l.call(r,p)).then(m=>h.call(r,m));let f=l.call(r,p);return h.call(r,f)}:r[a]=(...p)=>{let f=l.apply(r,p);return f===!1&&(f=h.apply(r,p)),f}}n.hooks=r}if(t.walkTokens){let r=this.defaults.walkTokens,i=t.walkTokens;n.walkTokens=function(a){let l=[];return l.push(i.call(this,a)),r&&(l=l.concat(r.call(this,a))),l}}this.defaults={...this.defaults,...n}}),this}setOptions(s){return this.defaults={...this.defaults,...s},this}lexer(s,e){return B.lex(s,e??this.defaults)}parser(s,e){return G.parse(s,e??this.defaults)}parseMarkdown(s){return(e,t)=>{let n={...t},r={...this.defaults,...n},i=this.onError(!!r.silent,!!r.async);if(this.defaults.async===!0&&n.async===!1)return i(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return i(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return i(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));r.hooks&&(r.hooks.options=r,r.hooks.block=s);let a=r.hooks?r.hooks.provideLexer():s?B.lex:B.lexInline,l=r.hooks?r.hooks.provideParser():s?G.parse:G.parseInline;if(r.async)return Promise.resolve(r.hooks?r.hooks.preprocess(e):e).then(h=>a(h,r)).then(h=>r.hooks?r.hooks.processAllTokens(h):h).then(h=>r.walkTokens?Promise.all(this.walkTokens(h,r.walkTokens)).then(()=>h):h).then(h=>l(h,r)).then(h=>r.hooks?r.hooks.postprocess(h):h).catch(i);try{r.hooks&&(e=r.hooks.preprocess(e));let h=a(e,r);r.hooks&&(h=r.hooks.processAllTokens(h)),r.walkTokens&&this.walkTokens(h,r.walkTokens);let p=l(h,r);return r.hooks&&(p=r.hooks.postprocess(p)),p}catch(h){return i(h)}}}onError(s,e){return t=>{if(t.message+=`
Please report this to https://github.com/markedjs/marked.`,s){let n="<p>An error occurred:</p><pre>"+q(t.message+"",!0)+"</pre>";return e?Promise.resolve(n):n}if(e)return Promise.reject(t);throw t}}},te=new ln;function T(s,e){return te.parse(s,e)}T.options=T.setOptions=function(s){return te.setOptions(s),T.defaults=te.defaults,cr(T.defaults),T};T.getDefaults=rt;T.defaults=re;T.use=function(...s){return te.use(...s),T.defaults=te.defaults,cr(T.defaults),T};T.walkTokens=function(s,e){return te.walkTokens(s,e)};T.parseInline=te.parseInline;T.Parser=G;T.parser=G.parse;T.Renderer=Ce;T.TextRenderer=ht;T.Lexer=B;T.lexer=B.lex;T.Tokenizer=Ee;T.Hooks=_e;T.parse=T;T.options;T.setOptions;T.use;T.walkTokens;T.parseInline;G.parse;B.lex;const on=`## Unifying Playable Ads: The CTA SDK Bridge\r
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
`;var cn=Object.getOwnPropertyDescriptor,hn=(s,e,t,n)=>{for(var r=n>1?void 0:n?cn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Wt=class extends F{constructor(){super(...arguments),this.markdownHtml=""}connectedCallback(){super.connectedCallback();const s=T.parse(on);typeof s=="string"&&(this.markdownHtml=s),this.requestUpdate()}render(){return M`
      <div class="cta-sdk-info">
        <div>${_s(this.markdownHtml)}</div>
      </div>
    `}};Wt=hn([Z("cta-sdk-page"),Ie("/cta-sdk")],Wt);var un=Object.getOwnPropertyDescriptor,pn=(s,e,t,n)=>{for(var r=n>1?void 0:n?un(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Vt=class extends F{render(){return M`
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
    `}};Vt=pn([Z("home-page"),Ie("/")],Vt);const dn="modulepreload",fn=function(s){return"/PlayableTools/"+s},Yt={},gn=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let h=function(p){return Promise.all(p.map(f=>Promise.resolve(f).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),l=a?.nonce||a?.getAttribute("nonce");r=h(t.map(p=>{if(p=fn(p),p in Yt)return;Yt[p]=!0;const f=p.endsWith(".css"),m=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${p}"]${m}`))return;const k=document.createElement("link");if(k.rel=f?"stylesheet":dn,f||(k.as="script"),k.crossOrigin="",k.href=p,l&&k.setAttribute("nonce",l),document.head.appendChild(k),f)return new Promise((x,S)=>{k.addEventListener("load",x),k.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${p}`)))})}))}function i(a){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=a,window.dispatchEvent(l),!l.defaultPrevented)throw a}return r.then(a=>{for(const l of a||[])l.status==="rejected"&&i(l.reason);return e().catch(i)})};class kr{static getBaseDir(){const e=window.location.origin+window.location.pathname.replace(/([?#].*)$/,"");return e.endsWith("/")?e:e+"/"}static buildFetchUrl(e,t){return this.getBaseDir()+e+t}}const mn={replaceTokens:{'<script type="module" crossorigin>':"<script>"}},bn=[{Name:"Facebook",InjeectScripts:["cta.Facebook.js"]},{Name:"Moloco",InjeectScripts:["cta.Moloco.js"],replaceTokens:{XMLHttpRequest:"XRQ"}},{Name:"Facebook_Zip",format:"zip",ExtractScripts:!0,InjeectScripts:["cta.Facebook_Zip.js"]},{Name:"Mintegral",format:"zip",OutputIndexHtmlName:"%name%.html",InjeectScripts:["cta.Mintegral.js"]},{Name:"IronSource",InjeectScripts:["cta.IronSource.js"]},{Name:"AdColony",InjeectScripts:["cta.AdColony.js"]},{Name:"Unity",InjeectScripts:["cta.Unity.js"]},{Name:"Applovin",InjeectScripts:["cta.Applovin.js"]},{Name:"Vungle",OutputIndexHtmlName:"ad.html",format:"zip",ExtraFiles:[{from:"./Vungle/index.html",to:"./index.html"}],InjeectScripts:["cta.Vungle.js"]},{Name:"TikTok",format:"zip",OutputIndexHtmlName:"index.html",ExtraFiles:[{from:"./TikTok/config.json",to:"./config.json"}],InjeectScripts:["cta.TikTok.js"]},{Name:"Google",OutputIndexHtmlName:"index.html",format:"zip",Sizes:{"320x480":"width=320,height=480","480x320":"width=480,height=320","300x250":"width=300,height=250"},InjeectScripts:["cta.Google.js"],replaceTokens:{"</title>":'</title> <meta name="ad.size" content="{{ad.size}}"><meta name="ad.orientation" content="landscape">'}}],yn={globalDefaults:mn,platforms:bn};var wn=Object.getOwnPropertyDescriptor,kn=(s,e,t,n)=>{for(var r=n>1?void 0:n?wn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Ve=class{constructor(){this.config=[],this.globalDefaults={},this.loadConfig(yn)}loadConfig(s){if(Array.isArray(s.platforms))this.config=s.platforms,s.globalDefaults&&typeof s.globalDefaults=="object"&&(this.globalDefaults=s.globalDefaults),console.log("PlayablePublishService: Loaded platforms config:",this.config);else throw new Error("Invalid config: platforms array missing")}getPlatforms(){return this.config}getAvailablePlatforms(){return this.config.map(s=>s.Name)}async processHtml(s,e,t){const n=this.config.find(l=>l.Name===e);if(!n)throw new Error(`Platform '${e}' not found in config`);let r=s,i=performance.now();n.replaceTokens&&(r=this.applyReplaceTokens(r,n.replaceTokens));let a=performance.now();if(console.log(`[PlayablePublishService] Platform replaceTokens (${e}): ${(a-i).toFixed(2)} ms`),n.InjeectScripts&&Array.isArray(n.InjeectScripts)){let l=performance.now();r=await this.injectScripts(r,n.InjeectScripts);let h=performance.now();console.log(`[PlayablePublishService] Script injection (${e}): ${(h-l).toFixed(2)} ms`)}return n.OutputIndexHtmlName&&t?.name,r}applyReplaceTokens(s,e){if(!e||Object.keys(e).length===0)return s;const t=Object.keys(e).map(r=>r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),n=new RegExp(t.join("|"),"g");return s.replace(n,r=>e[r]??r)}async injectScripts(s,e){let t=s;const n=e.map(async i=>{try{const a=kr.buildFetchUrl("publish-data/",i),l=await fetch(a);return l.ok?`<script>
${await l.text()}
<\/script>`:(console.warn(`Could not load script: ${i} from ${a}`),null)}catch(a){return console.warn(`Failed to inject script ${i}:`,a),null}}),r=(await Promise.all(n)).filter(Boolean);for(const i of r)if(/<head[^>]*>/i.test(t)){const a=t.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);if(a){const l=a[2],h=l.match(/<script[^>]*>/i);if(h){const p=a.index+a[1].length+l.indexOf(h[0]);t=t.slice(0,p)+`
${i}
`+t.slice(p)}else t=t.replace(/<\/head>/i,`${i}
</head>`)}}else/<\/body>/i.test(t)?t=t.replace(/<\/body>/i,`${i}
</body>`):t=t+i;return t}async processAllPlatforms(s,e){if(!e.outputDirectory)throw new Error("Output directory is required");const t=e.name||"Playable",n=e.suffix||"EN";let r=s,i=performance.now();this.globalDefaults.replaceTokens&&(r=this.applyReplaceTokens(r,this.globalDefaults.replaceTokens));let a=performance.now();console.log(`[PlayablePublishService] Global replaceTokens: ${(a-i).toFixed(2)} ms`);let l=this.config;e.selectedPlatforms&&Array.isArray(e.selectedPlatforms)&&e.selectedPlatforms.length>0&&(l=this.config.filter(f=>e.selectedPlatforms.includes(f.Name)));const h=l.length;let p=0;for(const f of l){const m=await this.createPlatformDirectory(e.outputDirectory,f.Name),k=await this.processHtml(r,f.Name,e),x=this.generateFileName(t,f.Name,n,f);f.format==="zip"?await this.createZipPackageToDirectory(k,x,m,f):await this.saveHtmlFileToDirectory(k,x,m),p++;const S=30+p/h*70;e.onProgress?.(S,f.Name)}}generateFileName(s,e,t,n){return n.OutputIndexHtmlName?n.OutputIndexHtmlName.includes("%name%")?n.OutputIndexHtmlName.replace("%name%",s):n.OutputIndexHtmlName:`${s}_${e}_${t}.html`}async createPlatformDirectory(s,e){try{const t=await s.getDirectoryHandle(e,{create:!0});return console.log(`Created/accessed directory: ${e}`),t}catch(t){throw new Error(`Failed to create platform directory ${e}: ${t}`)}}async saveHtmlFileToDirectory(s,e,t){let n=performance.now();try{const a=await(await t.getFileHandle(e,{create:!0})).createWritable();await a.write(s),await a.close();const l=(s.length/1024).toFixed(2);console.log(`Saved HTML file: ${e} (${l} KB)`)}catch(i){throw new Error(`Failed to save HTML file ${e}: ${i}`)}let r=performance.now();console.log(`[PlayablePublishService] Save HTML (${e}): ${(r-n).toFixed(2)} ms`)}async createZipPackageToDirectory(s,e,t,n){try{const r=(await gn(async()=>{const{default:C}=await import("./jszip.min-C3XFT1x8.js").then(z=>z.j);return{default:C}},[])).default,i=new r;if(i.file(e,s),n.ExtraFiles)for(const C of n.ExtraFiles)try{const z=`/publish-data/${C.from.replace("./","")}`,L=await fetch(z);if(L.ok){const V=await L.text();i.file(C.to.replace("./",""),V)}else console.warn(`Could not load extra file from: ${z}`)}catch(z){console.warn(`Could not load extra file: ${C.from}`,z)}let a=performance.now();const l=await i.generateAsync({type:"blob"});let h=performance.now();console.log(`[PlayablePublishService] Zipping (${e}): ${(h-a).toFixed(2)} ms`);let p=performance.now();const f=e.replace(".html",".zip"),k=await(await t.getFileHandle(f,{create:!0})).createWritable();await k.write(l),await k.close();let x=performance.now();console.log(`[PlayablePublishService] Save ZIP (${f}): ${(x-p).toFixed(2)} ms`);const S=(l.size/1024).toFixed(2);console.log(`Saved ZIP file: ${f} (${S} KB)`)}catch(r){throw new Error(`Failed to create ZIP package ${e}: ${r}`)}}async requestOutputDirectory(){if("showDirectoryPicker"in window)try{const s=await window.showDirectoryPicker();return console.log(`Selected output directory: ${s.name}`),s}catch(s){throw s instanceof Error&&s.name==="AbortError"?new Error("Directory selection was cancelled"):new Error(`Failed to select directory: ${s}`)}else throw new Error("File System Access API is not supported in this browser. Please use Chrome, Edge, or another supported browser.")}};Ve=kn([ns(de.Singleton)],Ve);var vn=Object.defineProperty,$n=(s,e,t,n)=>{for(var r=void 0,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(e,t,r)||r);return r&&vn(e,t,r),r};class vr extends F{constructor(){super(...arguments),this.dragActive=!1,this.loadedFile=null,this.isPublishing=!1,this.publishProgress=0,this.currentPlatform=null,this.publishStartTime=null,this.publishElapsed=null,this.playableTitle="",this.googlePlayUrl="",this.appStoreUrl="",this.customSuffix="EN",this.outputDirectory="",this.availablePlatforms=[],this.selectedPlatforms=[],this.STORAGE_KEYS={playableTitle:"playable-publisher-title",googlePlayUrl:"playable-publisher-google-url",appStoreUrl:"playable-publisher-app-store-url",customSuffix:"playable-publisher-suffix",selectedPlatforms:"playable-publisher-selected-platforms"}}connectedCallback(){super.connectedCallback(),this.loadFromLocalStorage(),this.playablePublishService&&typeof this.playablePublishService.getAvailablePlatforms=="function"&&(this.availablePlatforms=this.playablePublishService.getAvailablePlatforms(),(!this.selectedPlatforms||this.selectedPlatforms.length===0)&&(this.selectedPlatforms=[...this.availablePlatforms]))}render(){return M`
      <div class="playable-publisher">
        <div style="margin-bottom:1.5rem">
          <strong>Publish Playable Ad</strong><br />
          <small>
            Use this tool to upload your playable ad HTML file and prepare it
            for different platforms.<br />
            Drop your .html file below or select it manually.
          </small>
        </div>

        ${this.loadedFile?M`
              <div class="file-loaded-info">
                <strong>File loaded:</strong> ${this.loadedFile.name}
                (${(this.loadedFile.size/1024).toFixed(2)} KB)

                ${this.isPublishing?M`
                      <div class="progress-container">
                        <div class="progress-text">
                          Publishing... ${Math.round(this.publishProgress)}%
                          ${this.currentPlatform?M`<span style="margin-left:1em;">(${this.currentPlatform})</span>`:""}
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
            `:M`
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
        ${this.loadedFile?M`
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
                  ${this.availablePlatforms.map(e=>M`
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
          ${this.loadedFile&&this.playableTitle&&!this.isPublishing?M`
            <button 
              @click=${this._publishPlayable}
              style="margin-right: 0.5rem;"
              ?disabled=${!this.selectedPlatforms.length}
            >
              Publish
            </button>
          `:null}
          ${this.loadedFile&&!this.isPublishing?M`
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

For best results, please use Chrome 86+, Edge 86+, or another browser that supports the File System Access API.`),alert(`Publishing failed: ${t}`),this.isPublishing=!1,this.publishProgress=0,this.requestUpdate()}}_formatElapsed(e){const t=Math.floor(e/1e3),n=Math.floor(t/60),r=t%60;return n>0?`${n}m ${r}s`:`${r}s`}_readFileContent(e){return new Promise((t,n)=>{const r=new FileReader;r.onload=i=>{const a=i.target?.result;typeof a=="string"?t(a):n(new Error("Failed to read file as text"))},r.onerror=()=>n(new Error("Failed to read file")),r.readAsText(e)})}loadFromLocalStorage(){this.playableTitle=localStorage.getItem(this.STORAGE_KEYS.playableTitle)||"",this.googlePlayUrl=localStorage.getItem(this.STORAGE_KEYS.googlePlayUrl)||"",this.appStoreUrl=localStorage.getItem(this.STORAGE_KEYS.appStoreUrl)||"",this.customSuffix=localStorage.getItem(this.STORAGE_KEYS.customSuffix)||"EN";const e=localStorage.getItem(this.STORAGE_KEYS.selectedPlatforms);if(e)try{const t=JSON.parse(e);Array.isArray(t)&&(this.selectedPlatforms=t)}catch{}this.requestUpdate()}saveToLocalStorage(){localStorage.setItem(this.STORAGE_KEYS.playableTitle,this.playableTitle),localStorage.setItem(this.STORAGE_KEYS.googlePlayUrl,this.googlePlayUrl),localStorage.setItem(this.STORAGE_KEYS.appStoreUrl,this.appStoreUrl),localStorage.setItem(this.STORAGE_KEYS.customSuffix,this.customSuffix),localStorage.setItem(this.STORAGE_KEYS.selectedPlatforms,JSON.stringify(this.selectedPlatforms))}updateField(e,t){switch(e){case"playableTitle":this.playableTitle=t;break;case"googlePlayUrl":this.googlePlayUrl=t;break;case"appStoreUrl":this.appStoreUrl=t;break;case"customSuffix":this.customSuffix=t;break}this.saveToLocalStorage(),this.requestUpdate()}}$n([is(Ve)],vr.prototype,"playablePublishService");customElements.define("playable-publisher",vr);var xn=Object.getOwnPropertyDescriptor,_n=(s,e,t,n)=>{for(var r=n>1?void 0:n?xn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Qt=class extends F{render(){return M`
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
    `}};Qt=_n([Z("publish-page"),Ie("/publish")],Qt);var Sn=Object.getOwnPropertyDescriptor,Pn=(s,e,t,n)=>{for(var r=n>1?void 0:n?Sn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Kt=class extends F{render(){return M`
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
            <small
              >Rejects on invalid URLs in playable. Check embedded links and
              avoid Cyrillic. Google Play links should be short (e.g.,
              <code>https://play.google.com/store/apps/details?id=my.arena</code
              >). Use CTA button for store redirects. Alerts for
              misclicks.</small
            >
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
          </li>
          <li>
            <strong>IronSource</strong> — <em>5MB (HTML)</em><br />
            <span>Validation: Only in Ads Manager</span><br />
            <small>From 2025, accepts Unity builds in MRAID (not DAPI).</small>
          </li>
          <li>
            <strong>Moloco</strong> — <em>5MB (HTML)</em><br />
            <span>No validation tool available</span><br />
            <small
              >Uses Facebook's format and API. Code must NOT contain
              <code>XMLHttpRequest</code> (remove from PixiJS/Howler if
              present).</small
            >
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
            <small
              >Error if <code>config.json</code> is missing—add this file to the
              archive.</small
            >
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
            <small>Archive name must match the main folder/file inside.</small>
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
        </ul>
      </section>
    `}};Kt=Pn([Z("validate-page"),Ie("/validate")],Kt);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const An=s=>s??I;var Tn=Object.getOwnPropertyDescriptor,En=(s,e,t,n)=>{for(var r=n>1?void 0:n?Tn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Xt=class extends F{constructor(){super(...arguments),this.menuItems=[{label:"Home",path:"/",disabled:!1},{label:"CTA SDK",path:"/cta-sdk",disabled:!1},{label:"Publish",path:"/publish",disabled:!1},{label:"Validate",path:"/validate",disabled:!1},{label:"Compress assets",path:"/weather",disabled:!0},{label:"FAQ",path:"/faq",disabled:!0}],this.handleHashChange=()=>{this.requestUpdate()}}get currentPath(){let s=window.location.hash?window.location.hash.substring(1):"";return s.startsWith("/")||(s="/"+s),s}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleHashChange)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleHashChange)}render(){return M`
      <nav aria-label="Main menu">
        <ul>
          ${this.menuItems.map(s=>{const e=this.currentPath===s.path;return M`
              <li>
                <a
                  href=${An(s.disabled?void 0:`#${s.path.substring(1)}`)}
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
    `}};Xt=En([Z("nav-menu")],Xt);var Cn=Object.getOwnPropertyDescriptor,On=(s,e,t,n)=>{for(var r=n>1?void 0:n?Cn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let Jt=class extends F{render(){return M`
      <a href="/" class="site-logo-link">
        <img
          src="${kr.buildFetchUrl("","small-logo.jpg")}"
          alt="Logo"
          class="site-logo-img"
        />
        <span class="site-logo-title">
          <div class="site-logo-subheader">Gritsenko</div>
          Playable Ads Tools
        </span>
      </a>
    `}};Jt=On([Z("site-logo")],Jt);var Rn=Object.defineProperty,Mn=Object.getOwnPropertyDescriptor,ut=(s,e,t,n)=>{for(var r=n>1?void 0:n?Mn(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=(n?a(e,t,r):a(r))||r);return n&&r&&Rn(e,t,r),r};let be=class extends ks{constructor(){super(...arguments),this.sidebarOpen=!1}toggleSidebar(){this.sidebarOpen=!this.sidebarOpen}closeSidebar(){this.sidebarOpen=!1}render(){return M`
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
          </div>
        </aside>
        <main class="main">${this.body}</main>
      </div>
    `}};ut([Re({attribute:!1,type:Object})],be.prototype,"body",2);ut([Re({type:Boolean})],be.prototype,"sidebarOpen",2);be=ut([Z("main-layout")],be);var In=Object.getOwnPropertyDescriptor,Dn=(s,e,t,n)=>{for(var r=n>1?void 0:n?In(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(r=a(r)||r);return r};let er=class extends F{render(){return M`
      <router-outlet .defaultLayout="${be}"></router-outlet>
    `}};er=Dn([Z("app-root")],er);export{Mt as c,jn as g};
