(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const H=n=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(n,e)}):customElements.define(n,e)};/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ae=globalThis,tt=Ae.ShadowRoot&&(Ae.ShadyCSS===void 0||Ae.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,lr=Symbol(),Dt=new WeakMap;let Xr=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==lr)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(tt&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=Dt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&Dt.set(t,e))}return e}toString(){return this.cssText}};const Jr=n=>new Xr(typeof n=="string"?n:n+"",void 0,lr),es=(n,e)=>{if(tt)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),r=Ae.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,n.appendChild(s)}},Ut=tt?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return Jr(t)})(n):n;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:ts,defineProperty:rs,getOwnPropertyDescriptor:ss,getOwnPropertyNames:ns,getOwnPropertySymbols:is,getPrototypeOf:as}=Object,De=globalThis,zt=De.trustedTypes,os=zt?zt.emptyScript:"",ls=De.reactiveElementPolyfillSupport,me=(n,e)=>n,Ce={toAttribute(n,e){switch(e){case Boolean:n=n?os:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},rt=(n,e)=>!ts(n,e),jt={attribute:!0,type:String,converter:Ce,reflect:!1,useDefault:!1,hasChanged:rt};Symbol.metadata??=Symbol("metadata"),De.litPropertyMetadata??=new WeakMap;let ie=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=jt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),r=this.getPropertyDescriptor(e,s,t);r!==void 0&&rs(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){const{get:r,set:i}=ss(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){const o=r?.call(this);i?.call(this,a),this.requestUpdate(e,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??jt}static _$Ei(){if(this.hasOwnProperty(me("elementProperties")))return;const e=as(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(me("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(me("properties"))){const t=this.properties,s=[...ns(t),...is(t)];for(const r of s)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,r]of t)this.elementProperties.set(s,r)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const r=this._$Eu(t,s);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)t.unshift(Ut(r))}else e!==void 0&&t.push(Ut(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return es(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,s);if(r!==void 0&&s.reflect===!0){const i=(s.converter?.toAttribute!==void 0?s.converter:Ce).toAttribute(t,s.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){const s=this.constructor,r=s._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const i=s.getPropertyOptions(r),a=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Ce;this._$Em=r;const o=a.fromAttribute(t,i.type);this[r]=o??this._$Ej?.get(r)??o,this._$Em=null}}requestUpdate(e,t,s){if(e!==void 0){const r=this.constructor,i=this[e];if(s??=r.getPropertyOptions(e),!((s.hasChanged??rt)(i,t)||s.useDefault&&s.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:r,wrapped:i},a){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),i!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,i]of this._$Ep)this[r]=i;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,i]of s){const{wrapped:a}=i,o=this[r];a!==!0||this._$AL.has(r)||o===void 0||this.C(r,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};ie.elementStyles=[],ie.shadowRootOptions={mode:"open"},ie[me("elementProperties")]=new Map,ie[me("finalized")]=new Map,ls?.({ReactiveElement:ie}),(De.reactiveElementVersions??=[]).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const cs={attribute:!0,type:String,converter:Ce,reflect:!1,hasChanged:rt},hs=(n=cs,e,t)=>{const{kind:s,metadata:r}=t;let i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),s==="setter"&&((n=Object.create(n)).wrapped=!0),i.set(t.name,n),s==="accessor"){const{name:a}=t;return{set(o){const h=e.get.call(this);e.set.call(this,o),this.requestUpdate(a,h,n)},init(o){return o!==void 0&&this.C(a,void 0,n,o),o}}}if(s==="setter"){const{name:a}=t;return function(o){const h=this[a];e.call(this,o),this.requestUpdate(a,h,n)}}throw Error("Unsupported decorator location: "+s)};function V(n){return(e,t)=>typeof t=="object"?hs(n,e,t):((s,r,i)=>{const a=r.hasOwnProperty(i);return r.constructor.createProperty(i,s),a?Object.getOwnPropertyDescriptor(r,i):void 0})(n,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function us(n){return V({...n,state:!0,attribute:!1})}var Lt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function ei(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}var Ht={};/*! *****************************************************************************
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
***************************************************************************** */var Bt;function ps(){if(Bt)return Ht;Bt=1;var n;return function(e){(function(t){var s=typeof globalThis=="object"?globalThis:typeof Lt=="object"?Lt:typeof self=="object"?self:typeof this=="object"?this:h(),r=i(e);typeof s.Reflect<"u"&&(r=i(s.Reflect,r)),t(r,s),typeof s.Reflect>"u"&&(s.Reflect=e);function i(p,f){return function(m,v){Object.defineProperty(p,m,{configurable:!0,writable:!0,value:v}),f&&f(m,v)}}function a(){try{return Function("return this;")()}catch{}}function o(){try{return(0,eval)("(function() { return this; })()")}catch{}}function h(){return a()||o()}})(function(t,s){var r=Object.prototype.hasOwnProperty,i=typeof Symbol=="function",a=i&&typeof Symbol.toPrimitive<"u"?Symbol.toPrimitive:"@@toPrimitive",o=i&&typeof Symbol.iterator<"u"?Symbol.iterator:"@@iterator",h=typeof Object.create=="function",p={__proto__:[]}instanceof Array,f=!h&&!p,m={create:h?function(){return Ne(Object.create(null))}:p?function(){return Ne({__proto__:null})}:function(){return Ne({})},has:f?function(l,c){return r.call(l,c)}:function(l,c){return c in l},get:f?function(l,c){return r.call(l,c)?l[c]:void 0}:function(l,c){return l[c]}},v=Object.getPrototypeOf(Function),_=typeof Map=="function"&&typeof Map.prototype.entries=="function"?Map:Wr(),S=typeof Set=="function"&&typeof Set.prototype.entries=="function"?Set:Vr(),O=typeof WeakMap=="function"?WeakMap:Kr(),z=i?Symbol.for("@reflect-metadata:registry"):void 0,B=qr(),K=Gr(B);function _e(l,c,u,d){if($(u)){if(!At(l))throw new TypeError;if(!Tt(c))throw new TypeError;return Ur(l,c)}else{if(!At(l))throw new TypeError;if(!D(c))throw new TypeError;if(!D(d)&&!$(d)&&!ne(d))throw new TypeError;return ne(d)&&(d=void 0),u=N(u),zr(l,c,u,d)}}t("decorate",_e);function xe(l,c){function u(d,k){if(!D(d))throw new TypeError;if(!$(k)&&!Fr(k))throw new TypeError;$t(l,c,d,k)}return u}t("metadata",xe);function Le(l,c,u,d){if(!D(u))throw new TypeError;return $(d)||(d=N(d)),$t(l,c,u,d)}t("defineMetadata",Le);function ue(l,c,u){if(!D(c))throw new TypeError;return $(u)||(u=N(u)),wt(l,c,u)}t("hasMetadata",ue);function Y(l,c,u){if(!D(c))throw new TypeError;return $(u)||(u=N(u)),He(l,c,u)}t("hasOwnMetadata",Y);function Or(l,c,u){if(!D(c))throw new TypeError;return $(u)||(u=N(u)),vt(l,c,u)}t("getMetadata",Or);function Mr(l,c,u){if(!D(c))throw new TypeError;return $(u)||(u=N(u)),kt(l,c,u)}t("getOwnMetadata",Mr);function Rr(l,c){if(!D(l))throw new TypeError;return $(c)||(c=N(c)),_t(l,c)}t("getMetadataKeys",Rr);function Ir(l,c){if(!D(l))throw new TypeError;return $(c)||(c=N(c)),xt(l,c)}t("getOwnMetadataKeys",Ir);function Dr(l,c,u){if(!D(c))throw new TypeError;if($(u)||(u=N(u)),!D(c))throw new TypeError;$(u)||(u=N(u));var d=pe(c,u,!1);return $(d)?!1:d.OrdinaryDeleteMetadata(l,c,u)}t("deleteMetadata",Dr);function Ur(l,c){for(var u=l.length-1;u>=0;--u){var d=l[u],k=d(c);if(!$(k)&&!ne(k)){if(!Tt(k))throw new TypeError;c=k}}return c}function zr(l,c,u,d){for(var k=l.length-1;k>=0;--k){var M=l[k],U=M(c,u,d);if(!$(U)&&!ne(U)){if(!D(U))throw new TypeError;d=U}}return d}function wt(l,c,u){var d=He(l,c,u);if(d)return!0;var k=Fe(c);return ne(k)?!1:wt(l,k,u)}function He(l,c,u){var d=pe(c,u,!1);return $(d)?!1:Pt(d.OrdinaryHasOwnMetadata(l,c,u))}function vt(l,c,u){var d=He(l,c,u);if(d)return kt(l,c,u);var k=Fe(c);if(!ne(k))return vt(l,k,u)}function kt(l,c,u){var d=pe(c,u,!1);if(!$(d))return d.OrdinaryGetOwnMetadata(l,c,u)}function $t(l,c,u,d){var k=pe(u,d,!0);k.OrdinaryDefineOwnMetadata(l,c,u,d)}function _t(l,c){var u=xt(l,c),d=Fe(l);if(d===null)return u;var k=_t(d,c);if(k.length<=0)return u;if(u.length<=0)return k;for(var M=new S,U=[],x=0,g=u;x<g.length;x++){var b=g[x],y=M.has(b);y||(M.add(b),U.push(b))}for(var w=0,P=k;w<P.length;w++){var b=P[w],y=M.has(b);y||(M.add(b),U.push(b))}return U}function xt(l,c){var u=pe(l,c,!1);return u?u.OrdinaryOwnMetadataKeys(l,c):[]}function St(l){if(l===null)return 1;switch(typeof l){case"undefined":return 0;case"boolean":return 2;case"string":return 3;case"symbol":return 4;case"number":return 5;case"object":return l===null?1:6;default:return 6}}function $(l){return l===void 0}function ne(l){return l===null}function jr(l){return typeof l=="symbol"}function D(l){return typeof l=="object"?l!==null:typeof l=="function"}function Lr(l,c){switch(St(l)){case 0:return l;case 1:return l;case 2:return l;case 3:return l;case 4:return l;case 5:return l}var u="string",d=Ct(l,a);if(d!==void 0){var k=d.call(l,u);if(D(k))throw new TypeError;return k}return Hr(l)}function Hr(l,c){var u,d,k;{var M=l.toString;if(Se(M)){var d=M.call(l);if(!D(d))return d}var u=l.valueOf;if(Se(u)){var d=u.call(l);if(!D(d))return d}}throw new TypeError}function Pt(l){return!!l}function Br(l){return""+l}function N(l){var c=Lr(l);return jr(c)?c:Br(c)}function At(l){return Array.isArray?Array.isArray(l):l instanceof Object?l instanceof Array:Object.prototype.toString.call(l)==="[object Array]"}function Se(l){return typeof l=="function"}function Tt(l){return typeof l=="function"}function Fr(l){switch(St(l)){case 3:return!0;case 4:return!0;default:return!1}}function Be(l,c){return l===c||l!==l&&c!==c}function Ct(l,c){var u=l[c];if(u!=null){if(!Se(u))throw new TypeError;return u}}function Et(l){var c=Ct(l,o);if(!Se(c))throw new TypeError;var u=c.call(l);if(!D(u))throw new TypeError;return u}function Ot(l){return l.value}function Mt(l){var c=l.next();return c.done?!1:c}function Rt(l){var c=l.return;c&&c.call(l)}function Fe(l){var c=Object.getPrototypeOf(l);if(typeof l!="function"||l===v||c!==v)return c;var u=l.prototype,d=u&&Object.getPrototypeOf(u);if(d==null||d===Object.prototype)return c;var k=d.constructor;return typeof k!="function"||k===l?c:k}function Nr(){var l;!$(z)&&typeof s.Reflect<"u"&&!(z in s.Reflect)&&typeof s.Reflect.defineMetadata=="function"&&(l=Zr(s.Reflect));var c,u,d,k=new O,M={registerProvider:U,getProvider:g,setProvider:y};return M;function U(w){if(!Object.isExtensible(M))throw new Error("Cannot add provider to a frozen registry.");switch(!0){case l===w:break;case $(c):c=w;break;case c===w:break;case $(u):u=w;break;case u===w:break;default:d===void 0&&(d=new S),d.add(w);break}}function x(w,P){if(!$(c)){if(c.isProviderFor(w,P))return c;if(!$(u)){if(u.isProviderFor(w,P))return c;if(!$(d))for(var E=Et(d);;){var R=Mt(E);if(!R)return;var F=Ot(R);if(F.isProviderFor(w,P))return Rt(E),F}}}if(!$(l)&&l.isProviderFor(w,P))return l}function g(w,P){var E=k.get(w),R;return $(E)||(R=E.get(P)),$(R)&&(R=x(w,P),$(R)||($(E)&&(E=new _,k.set(w,E)),E.set(P,R))),R}function b(w){if($(w))throw new TypeError;return c===w||u===w||!$(d)&&d.has(w)}function y(w,P,E){if(!b(E))throw new Error("Metadata provider not registered.");var R=g(w,P);if(R!==E){if(!$(R))return!1;var F=k.get(w);$(F)&&(F=new _,k.set(w,F)),F.set(P,E)}return!0}}function qr(){var l;return!$(z)&&D(s.Reflect)&&Object.isExtensible(s.Reflect)&&(l=s.Reflect[z]),$(l)&&(l=Nr()),!$(z)&&D(s.Reflect)&&Object.isExtensible(s.Reflect)&&Object.defineProperty(s.Reflect,z,{enumerable:!1,configurable:!1,writable:!1,value:l}),l}function Gr(l){var c=new O,u={isProviderFor:function(b,y){var w=c.get(b);return $(w)?!1:w.has(y)},OrdinaryDefineOwnMetadata:U,OrdinaryHasOwnMetadata:k,OrdinaryGetOwnMetadata:M,OrdinaryOwnMetadataKeys:x,OrdinaryDeleteMetadata:g};return B.registerProvider(u),u;function d(b,y,w){var P=c.get(b),E=!1;if($(P)){if(!w)return;P=new _,c.set(b,P),E=!0}var R=P.get(y);if($(R)){if(!w)return;if(R=new _,P.set(y,R),!l.setProvider(b,y,u))throw P.delete(y),E&&c.delete(b),new Error("Wrong provider for target.")}return R}function k(b,y,w){var P=d(y,w,!1);return $(P)?!1:Pt(P.has(b))}function M(b,y,w){var P=d(y,w,!1);if(!$(P))return P.get(b)}function U(b,y,w,P){var E=d(w,P,!0);E.set(b,y)}function x(b,y){var w=[],P=d(b,y,!1);if($(P))return w;for(var E=P.keys(),R=Et(E),F=0;;){var It=Mt(R);if(!It)return w.length=F,w;var Yr=Ot(It);try{w[F]=Yr}catch(Qr){try{Rt(R)}finally{throw Qr}}F++}}function g(b,y,w){var P=d(y,w,!1);if($(P)||!P.delete(b))return!1;if(P.size===0){var E=c.get(y);$(E)||(E.delete(w),E.size===0&&c.delete(E))}return!0}}function Zr(l){var c=l.defineMetadata,u=l.hasOwnMetadata,d=l.getOwnMetadata,k=l.getOwnMetadataKeys,M=l.deleteMetadata,U=new O,x={isProviderFor:function(g,b){var y=U.get(g);return!$(y)&&y.has(b)?!0:k(g,b).length?($(y)&&(y=new S,U.set(g,y)),y.add(b),!0):!1},OrdinaryDefineOwnMetadata:c,OrdinaryHasOwnMetadata:u,OrdinaryGetOwnMetadata:d,OrdinaryOwnMetadataKeys:k,OrdinaryDeleteMetadata:M};return x}function pe(l,c,u){var d=B.getProvider(l,c);if(!$(d))return d;if(u){if(B.setProvider(l,c,K))return K;throw new Error("Illegal state.")}}function Wr(){var l={},c=[],u=function(){function x(g,b,y){this._index=0,this._keys=g,this._values=b,this._selector=y}return x.prototype["@@iterator"]=function(){return this},x.prototype[o]=function(){return this},x.prototype.next=function(){var g=this._index;if(g>=0&&g<this._keys.length){var b=this._selector(this._keys[g],this._values[g]);return g+1>=this._keys.length?(this._index=-1,this._keys=c,this._values=c):this._index++,{value:b,done:!1}}return{value:void 0,done:!0}},x.prototype.throw=function(g){throw this._index>=0&&(this._index=-1,this._keys=c,this._values=c),g},x.prototype.return=function(g){return this._index>=0&&(this._index=-1,this._keys=c,this._values=c),{value:g,done:!0}},x}(),d=function(){function x(){this._keys=[],this._values=[],this._cacheKey=l,this._cacheIndex=-2}return Object.defineProperty(x.prototype,"size",{get:function(){return this._keys.length},enumerable:!0,configurable:!0}),x.prototype.has=function(g){return this._find(g,!1)>=0},x.prototype.get=function(g){var b=this._find(g,!1);return b>=0?this._values[b]:void 0},x.prototype.set=function(g,b){var y=this._find(g,!0);return this._values[y]=b,this},x.prototype.delete=function(g){var b=this._find(g,!1);if(b>=0){for(var y=this._keys.length,w=b+1;w<y;w++)this._keys[w-1]=this._keys[w],this._values[w-1]=this._values[w];return this._keys.length--,this._values.length--,Be(g,this._cacheKey)&&(this._cacheKey=l,this._cacheIndex=-2),!0}return!1},x.prototype.clear=function(){this._keys.length=0,this._values.length=0,this._cacheKey=l,this._cacheIndex=-2},x.prototype.keys=function(){return new u(this._keys,this._values,k)},x.prototype.values=function(){return new u(this._keys,this._values,M)},x.prototype.entries=function(){return new u(this._keys,this._values,U)},x.prototype["@@iterator"]=function(){return this.entries()},x.prototype[o]=function(){return this.entries()},x.prototype._find=function(g,b){if(!Be(this._cacheKey,g)){this._cacheIndex=-1;for(var y=0;y<this._keys.length;y++)if(Be(this._keys[y],g)){this._cacheIndex=y;break}}return this._cacheIndex<0&&b&&(this._cacheIndex=this._keys.length,this._keys.push(g),this._values.push(void 0)),this._cacheIndex},x}();return d;function k(x,g){return x}function M(x,g){return g}function U(x,g){return[x,g]}}function Vr(){var l=function(){function c(){this._map=new _}return Object.defineProperty(c.prototype,"size",{get:function(){return this._map.size},enumerable:!0,configurable:!0}),c.prototype.has=function(u){return this._map.has(u)},c.prototype.add=function(u){return this._map.set(u,u),this},c.prototype.delete=function(u){return this._map.delete(u)},c.prototype.clear=function(){this._map.clear()},c.prototype.keys=function(){return this._map.keys()},c.prototype.values=function(){return this._map.keys()},c.prototype.entries=function(){return this._map.entries()},c.prototype["@@iterator"]=function(){return this.keys()},c.prototype[o]=function(){return this.keys()},c}();return l}function Kr(){var l=16,c=m.create(),u=d();return function(){function g(){this._key=d()}return g.prototype.has=function(b){var y=k(b,!1);return y!==void 0?m.has(y,this._key):!1},g.prototype.get=function(b){var y=k(b,!1);return y!==void 0?m.get(y,this._key):void 0},g.prototype.set=function(b,y){var w=k(b,!0);return w[this._key]=y,this},g.prototype.delete=function(b){var y=k(b,!1);return y!==void 0?delete y[this._key]:!1},g.prototype.clear=function(){this._key=d()},g}();function d(){var g;do g="@@WeakMap@@"+x();while(m.has(c,g));return c[g]=!0,g}function k(g,b){if(!r.call(g,u)){if(!b)return;Object.defineProperty(g,u,{value:m.create()})}return g[u]}function M(g,b){for(var y=0;y<b;++y)g[y]=Math.random()*255|0;return g}function U(g){if(typeof Uint8Array=="function"){var b=new Uint8Array(g);return typeof crypto<"u"?crypto.getRandomValues(b):typeof msCrypto<"u"?msCrypto.getRandomValues(b):M(b,g),b}return M(new Array(g),g)}function x(){var g=U(l);g[6]=g[6]&79|64,g[8]=g[8]&191|128;for(var b="",y=0;y<l;++y){var w=g[y];(y===4||y===6||y===8)&&(b+="-"),w<16&&(b+="0"),b+=w.toString(16).toLowerCase()}return b}}function Ne(l){return l.__=void 0,delete l.__,l}})}(n||(n={})),Ht}ps();const ae={Singleton:0,Transient:2};class X{constructor(){this.services=new Map,this.singletonInstances=new Map,this.tokenRegistry=new Map}static getInstance(){return X.instance||(X.instance=new X),X.instance}addService(e,t,s){this.services.set(e,{token:e,implementation:t,lifetime:s}),s===ae.Singleton&&(this.singletonInstances.has(e)||this.singletonInstances.set(e,new t))}getOrCreateToken(e){const t=e.name;return this.tokenRegistry.has(t)||this.tokenRegistry.set(t,Symbol(t)),this.tokenRegistry.get(t)}getService(e){const t=this.services.get(e);if(!t)throw new Error(`Service not registered for token: ${e.toString()}`);switch(t.lifetime){case ae.Singleton:return this.getSingletonInstance(t);case ae.Transient:return new t.implementation;default:throw new Error(`Unsupported lifetime: ${t.lifetime}`)}}getSingletonInstance(e){return this.singletonInstances.has(e.token)||this.singletonInstances.set(e.token,new e.implementation),this.singletonInstances.get(e.token)}}function cr(n=ae.Singleton){return function(e){const t=X.getInstance(),s=t.getOrCreateToken(e);return t.addService(s,e,n),e}}function hr(n){return function(e,t){const s=n||Reflect.getMetadata("design:type",e,t);if(!s)throw new Error(`Cannot resolve type for property '${t}'. Make sure emitDecoratorMetadata is enabled.`);const r=X.getInstance(),i=r.getOrCreateToken(s);Object.defineProperty(e,t,{get:function(){return r.getService(i)},enumerable:!0,configurable:!0})}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const st=globalThis,Ee=st.trustedTypes,Ft=Ee?Ee.createPolicy("lit-html",{createHTML:n=>n}):void 0,ur="$lit$",W=`lit$${Math.random().toFixed(9).slice(2)}$`,pr="?"+W,ds=`<${pr}>`,ee=document,ye=()=>ee.createComment(""),we=n=>n===null||typeof n!="object"&&typeof n!="function",nt=Array.isArray,fs=n=>nt(n)||typeof n?.[Symbol.iterator]=="function",qe=`[ 	
\f\r]`,de=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Nt=/-->/g,qt=/>/g,Q=RegExp(`>|${qe}(?:([^\\s"'>=/]+)(${qe}*=${qe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Gt=/'/g,Zt=/"/g,dr=/^(?:script|style|textarea|title)$/i,gs=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),A=gs(1),te=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),Wt=new WeakMap,J=ee.createTreeWalker(ee,129);function fr(n,e){if(!nt(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ft!==void 0?Ft.createHTML(e):e}const ms=(n,e)=>{const t=n.length-1,s=[];let r,i=e===2?"<svg>":e===3?"<math>":"",a=de;for(let o=0;o<t;o++){const h=n[o];let p,f,m=-1,v=0;for(;v<h.length&&(a.lastIndex=v,f=a.exec(h),f!==null);)v=a.lastIndex,a===de?f[1]==="!--"?a=Nt:f[1]!==void 0?a=qt:f[2]!==void 0?(dr.test(f[2])&&(r=RegExp("</"+f[2],"g")),a=Q):f[3]!==void 0&&(a=Q):a===Q?f[0]===">"?(a=r??de,m=-1):f[1]===void 0?m=-2:(m=a.lastIndex-f[2].length,p=f[1],a=f[3]===void 0?Q:f[3]==='"'?Zt:Gt):a===Zt||a===Gt?a=Q:a===Nt||a===qt?a=de:(a=Q,r=void 0);const _=a===Q&&n[o+1].startsWith("/>")?" ":"";i+=a===de?h+ds:m>=0?(s.push(p),h.slice(0,m)+ur+h.slice(m)+W+_):h+W+(m===-2?o:_)}return[fr(n,i+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};let Ze=class gr{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let i=0,a=0;const o=e.length-1,h=this.parts,[p,f]=ms(e,t);if(this.el=gr.createElement(p,s),J.currentNode=this.el.content,t===2||t===3){const m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(r=J.nextNode())!==null&&h.length<o;){if(r.nodeType===1){if(r.hasAttributes())for(const m of r.getAttributeNames())if(m.endsWith(ur)){const v=f[a++],_=r.getAttribute(m).split(W),S=/([.?@])?(.*)/.exec(v);h.push({type:1,index:i,name:S[2],strings:_,ctor:S[1]==="."?ys:S[1]==="?"?ws:S[1]==="@"?vs:Ue}),r.removeAttribute(m)}else m.startsWith(W)&&(h.push({type:6,index:i}),r.removeAttribute(m));if(dr.test(r.tagName)){const m=r.textContent.split(W),v=m.length-1;if(v>0){r.textContent=Ee?Ee.emptyScript:"";for(let _=0;_<v;_++)r.append(m[_],ye()),J.nextNode(),h.push({type:2,index:++i});r.append(m[v],ye())}}}else if(r.nodeType===8)if(r.data===pr)h.push({type:2,index:i});else{let m=-1;for(;(m=r.data.indexOf(W,m+1))!==-1;)h.push({type:7,index:i}),m+=W.length-1}i++}}static createElement(e,t){const s=ee.createElement("template");return s.innerHTML=e,s}};function le(n,e,t=n,s){if(e===te)return e;let r=s!==void 0?t._$Co?.[s]:t._$Cl;const i=we(e)?void 0:e._$litDirective$;return r?.constructor!==i&&(r?._$AO?.(!1),i===void 0?r=void 0:(r=new i(n),r._$AT(n,t,s)),s!==void 0?(t._$Co??=[])[s]=r:t._$Cl=r),r!==void 0&&(e=le(n,r._$AS(n,e.values),r,s)),e}let bs=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,r=(e?.creationScope??ee).importNode(t,!0);J.currentNode=r;let i=J.nextNode(),a=0,o=0,h=s[0];for(;h!==void 0;){if(a===h.index){let p;h.type===2?p=new it(i,i.nextSibling,this,e):h.type===1?p=new h.ctor(i,h.name,h.strings,this,e):h.type===6&&(p=new ks(i,this,e)),this._$AV.push(p),h=s[++o]}a!==h?.index&&(i=J.nextNode(),a++)}return J.currentNode=ee,r}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},it=class mr{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=le(this,e,t),we(e)?e===I||e==null||e===""?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==te&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):fs(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&we(this._$AH)?this._$AA.nextSibling.data=e:this.T(ee.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,r=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=Ze.createElement(fr(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(t);else{const i=new bs(r,this),a=i.u(this.options);i.p(t),this.T(a),this._$AH=i}}_$AC(e){let t=Wt.get(e.strings);return t===void 0&&Wt.set(e.strings,t=new Ze(e)),t}k(e){nt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,r=0;for(const i of e)r===t.length?t.push(s=new mr(this.O(ye()),this.O(ye()),this,this.options)):s=t[r],s._$AI(i),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=e.nextSibling;e.remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Ue=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,r,i){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=I}_$AI(e,t=this,s,r){const i=this.strings;let a=!1;if(i===void 0)e=le(this,e,t,0),a=!we(e)||e!==this._$AH&&e!==te,a&&(this._$AH=e);else{const o=e;let h,p;for(e=i[0],h=0;h<i.length-1;h++)p=le(this,o[s+h],t,h),p===te&&(p=this._$AH[h]),a||=!we(p)||p!==this._$AH[h],p===I?e=I:e!==I&&(e+=(p??"")+i[h+1]),this._$AH[h]=p}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ys=class extends Ue{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}},ws=class extends Ue{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}},vs=class extends Ue{constructor(e,t,s,r,i){super(e,t,s,r,i),this.type=5}_$AI(e,t=this){if((e=le(this,e,t,0)??I)===te)return;const s=this._$AH,r=e===I&&s!==I||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,i=e!==I&&(s===I||r);r&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ks=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){le(this,e)}};const $s=st.litHtmlPolyfillSupport;$s?.(Ze,it),(st.litHtmlVersions??=[]).push("3.3.1");const _s=(n,e,t)=>{const s=t?.renderBefore??e;let r=s._$litPart$;if(r===void 0){const i=t?.renderBefore??null;s._$litPart$=r=new it(e.insertBefore(ye(),i),i,void 0,t??{})}return r._$AI(n),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const at=globalThis;let oe=class extends ie{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=_s(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return te}};oe._$litElement$=!0,oe.finalized=!0,at.litElementHydrateSupport?.({LitElement:oe});const xs=at.litElementPolyfillSupport;xs?.({LitElement:oe});(at.litElementVersions??=[]).push("4.2.1");class Ss{update(e){e.title&&(document.title=e.title);let t=document.querySelector('meta[name="description"]');t||(t=document.createElement("meta"),t.setAttribute("name","description"),document.head.appendChild(t)),t.setAttribute("content",e.description||"")}}const Ge=new Ss;var Ps=Object.defineProperty,As=Object.getOwnPropertyDescriptor,ot=(n,e,t,s)=>{for(var r=s>1?void 0:s?As(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=(s?a(e,t,r):a(r))||r);return s&&r&&Ps(e,t,r),r};let Oe=class extends oe{constructor(){super(...arguments),this.currentPath="",this.handleNavigation=()=>{const n=window.location.hash;let e=n?n.substring(1):"";e.startsWith("/")||(e="/"+e),this.currentPath=e,this.requestUpdate()}}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleNavigation),this.handleNavigation()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleNavigation)}createRenderRoot(){return this}render(){for(const[n,e]of br.entries()){const t=new RegExp("^"+n.replace(/:[^\s/]+/g,"([\\w-]+)")+"$"),s=this.currentPath.match(t);if(s){e.metadata?Ge.update(e.metadata):Ge.update({title:"PlayableTools"});const r=s.slice(1),i=new e.component;return i.routeParams=r,this.renderContentWithLayout(()=>A`<div>${i}</div>`)}}return Ge.update({title:"Page Not Found"}),this.renderContentWithLayout(()=>A`<h1>404 Not Found</h1>`)}renderContentWithLayout(n){if(!this.defaultLayout)return n();const e=new this.defaultLayout;return e.body=n(),A`
            <div>${e}</div>
        `}};ot([V({attribute:!1})],Oe.prototype,"defaultLayout",2);ot([us()],Oe.prototype,"currentPath",2);Oe=ot([H("router-outlet")],Oe);const br=new Map;function he(n,e){return function(t){return br.set(n,{component:t,metadata:e}),t}}const yt=class yt extends oe{createRenderRoot(){return this.constructor.useShadowDom?super.createRenderRoot():this}};yt.useShadowDom=!1;let L=yt;class Ts extends L{}var Cs=Object.defineProperty,Es=Object.getOwnPropertyDescriptor,ke=(n,e,t,s)=>{for(var r=s>1?void 0:s?Es(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=(s?a(e,t,r):a(r))||r);return s&&r&&Cs(e,t,r),r};let ce=class extends L{constructor(){super(...arguments),this.open=!1,this.src="",this.alt="",this.thumbWidth="500px",this.openPopup=()=>{this.open=!0,this.requestUpdate()},this.closePopup=()=>{this.open=!1,this.requestUpdate()}}render(){return A`
      <img
        src="${this.src}"
        alt="${this.alt}"
        style="max-width: ${this.thumbWidth}; display: block; margin: 1em auto; border: 1px solid #ccc; border-radius: 8px; cursor: zoom-in;"
        @click=${this.openPopup}
      />
      ${this.open?A`
        <div
          style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;"
          @click=${this.closePopup}
        >
          <img
            src="${this.src}"
            alt="${this.alt} full size"
            style="max-width:90vw;max-height:90vh;box-shadow:0 0 32px #000;border-radius:12px;"
            @click=${n=>n.stopPropagation()}
          />
          <button
            style="position:absolute;top:32px;right:48px;font-size:2rem;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:48px;height:48px;cursor:pointer;"
            @click=${this.closePopup}
            aria-label="Close preview"
          >×</button>
        </div>
      `:""}
    `}};ke([V({type:Boolean})],ce.prototype,"open",2);ke([V({type:String})],ce.prototype,"src",2);ke([V({type:String})],ce.prototype,"alt",2);ke([V({type:String})],ce.prototype,"thumbWidth",2);ce=ke([H("image-popup")],ce);var Os=Object.getOwnPropertyDescriptor,Ms=(n,e,t,s)=>{for(var r=s>1?void 0:s?Os(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let We=class{async convertFilesToBase64(n,e){const t=[];for(let s=0;s<n.length;s++){const r=n[s],i=r.type||"application/octet-stream",a=await this.fileToDataUrl(r),o=a.split(",")[1]||"";t.push({file:r,name:r.name,mimeType:i,dataUrl:a,originalSize:r.size,base64Size:o.length}),e&&e(Math.round((s+1)/n.length*100))}return t}fileToDataUrl(n){return new Promise((e,t)=>{const s=new FileReader;s.onload=()=>e(s.result),s.onerror=t,s.readAsDataURL(n)})}};We=Ms([cr(ae.Singleton)],We);var Rs=Object.defineProperty,Is=Object.getOwnPropertyDescriptor,yr=(n,e,t,s)=>{for(var r=s>1?void 0:s?Is(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=(s?a(e,t,r):a(r))||r);return s&&r&&Rs(e,t,r),r};let Ve=class extends L{constructor(){super(...arguments),this.dragActive=!1,this.files=[],this.progress=0,this.results=[],this.processing=!1,this.copiedIndex=null,this._onDragOver=e=>{e.preventDefault(),this.dragActive=!0,this.requestUpdate()},this._onDragLeave=e=>{e.preventDefault(),this.dragActive=!1,this.requestUpdate()},this._onDrop=e=>{e.preventDefault(),this.dragActive=!1,e.dataTransfer?.files?.length&&this._handleFiles(e.dataTransfer.files)},this._onFileChange=e=>{const t=e.target;t.files?.length&&this._handleFiles(t.files)}}_downloadDataUrl(e,t,s){e.preventDefault();const r=window.open();r&&(r.document.write("<pre>"+this._escapeHtml(t)+"</pre>"),r.document.title=s+" (Base64)")}_escapeHtml(e){return e.replace(/[&<>"']/g,function(t){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[t]})}async _handleFiles(e){this.files=Array.from(e),this.progress=0,this.processing=!0,this.results=[],this.requestUpdate(),this.results=await this.base64Service.convertFilesToBase64(this.files,t=>{this.progress=t,this.requestUpdate()}),this.processing=!1,this.requestUpdate()}async _copyToClipboard(e,t){try{await navigator.clipboard.writeText(e),this.copiedIndex=t,this.requestUpdate(),setTimeout(()=>{this.copiedIndex=null,this.requestUpdate()},3e3)}catch{}}_selectDataUrl(e){const t=e.currentTarget;if(!t)return;const s=document.createRange();s.selectNodeContents(t);const r=window.getSelection();r?.removeAllRanges(),r?.addRange(s)}render(){return A`
      <h1>Convert assets to base64 format</h1>
      <p>
        This app provides a simple tool to convert media files to Base64 to use
        in playable ads.
      </p>

      <div
        class="dropzone ${this.dragActive?"dragover":""}"
        @dragover=${this._onDragOver}
        @dragleave=${this._onDragLeave}
        @drop=${this._onDrop}
      >
        <p>Drop your files here or</p>
        <label class="file-select-button">
          Select files
          <input type="file" multiple @change=${this._onFileChange} />
        </label>
      </div>

      ${this.processing?A`
            <div class="progress-container">
              <div class="progress-bar-background">
                <div
                  class="progress-bar-fill"
                  style="width: ${this.progress}%;"
                ></div>
              </div>
              <div style="margin-top:0.5em; font-size:0.95em;">
                Processing... ${this.progress}%
              </div>
            </div>
          `:null}
      ${this.results.length>0?A`
            <div class="file-list">
              ${this.results.map((e,t)=>A`
                  <div class="file-row">
                    <div class="file-name">
                      <span>${e.name}</span>
                      <div class="file-size">
                        ${(e.originalSize/1024).toFixed(2)} KB →
                        ${(e.base64Size/1024).toFixed(2)} KB
                      </div>
                    </div>
                    ${e.dataUrl.length>2048?A`<span class="data-url long-content"
                          >content too long to display
                          <a
                            href="#"
                            @click=${s=>this._downloadDataUrl(s,e.dataUrl,e.name)}
                            >Open in new tab</a
                          ></span
                        >`:A`<span
                          class="data-url"
                          tabindex="0"
                          @click=${s=>this._selectDataUrl(s)}
                          @focus=${s=>this._selectDataUrl(s)}
                          >${e.dataUrl}</span
                        >`}
                    <button
                      class="copy-btn${this.copiedIndex===t?" copied":""}"
                      @click=${()=>this._copyToClipboard(e.dataUrl,t)}
                    >
                      ${this.copiedIndex===t?"Copied":"Copy"}
                    </button>
                  </div>
                `)}
            </div>
          `:null}
    `}};yr([hr(We)],Ve.prototype,"base64Service",2);Ve=yr([H("base64-page"),he("/base64",{title:"Base64 Converter",description:"A simple tool to convert text to Base64 and vice versa."})],Ve);var Ds=Object.getOwnPropertyDescriptor,Us=(n,e,t,s)=>{for(var r=s>1?void 0:s?Ds(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let Vt=class extends L{render(){return A`
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
    `}};Vt=Us([H("compress-assets-page"),he("/compress-assets")],Vt);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const zs={CHILD:2},js=n=>(...e)=>({_$litDirective$:n,values:e});class Ls{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class Ke extends Ls{constructor(e){if(super(e),this.it=I,e.type!==zs.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===I||e==null)return this._t=void 0,this.it=e;if(e===te)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Ke.directiveName="unsafeHTML",Ke.resultType=1;const Hs=js(Ke);function lt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var se=lt();function wr(n){se=n}var be={exec:()=>null};function T(n,e=""){let t=typeof n=="string"?n:n.source,s={replace:(r,i)=>{let a=typeof i=="string"?i:i.source;return a=a.replace(j.caret,"$1"),t=t.replace(r,a),s},getRegex:()=>new RegExp(t,e)};return s}var j={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:n=>new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}#`),htmlBeginRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}<(?:[a-z].*>|!--)`,"i")},Bs=/^(?:[ \t]*(?:\n|$))+/,Fs=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Ns=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,$e=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,qs=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,ct=/(?:[*+-]|\d{1,9}[.)])/,vr=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,kr=T(vr).replace(/bull/g,ct).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Gs=T(vr).replace(/bull/g,ct).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),ht=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Zs=/^[^\n]+/,ut=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Ws=T(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",ut).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Vs=T(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,ct).getRegex(),ze="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",pt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Ks=T("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",pt).replace("tag",ze).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),$r=T(ht).replace("hr",$e).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ze).getRegex(),Ys=T(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",$r).getRegex(),dt={blockquote:Ys,code:Fs,def:Ws,fences:Ns,heading:qs,hr:$e,html:Ks,lheading:kr,list:Vs,newline:Bs,paragraph:$r,table:be,text:Zs},Kt=T("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",$e).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ze).getRegex(),Qs={...dt,lheading:Gs,table:Kt,paragraph:T(ht).replace("hr",$e).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Kt).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ze).getRegex()},Xs={...dt,html:T(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",pt).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:be,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:T(ht).replace("hr",$e).replace("heading",` *#{1,6} *[^
]`).replace("lheading",kr).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Js=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,en=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,_r=/^( {2,}|\\)\n(?!\s*$)/,tn=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,je=/[\p{P}\p{S}]/u,ft=/[\s\p{P}\p{S}]/u,xr=/[^\s\p{P}\p{S}]/u,rn=T(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,ft).getRegex(),Sr=/(?!~)[\p{P}\p{S}]/u,sn=/(?!~)[\s\p{P}\p{S}]/u,nn=/(?:[^\s\p{P}\p{S}]|~)/u,an=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,Pr=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,on=T(Pr,"u").replace(/punct/g,je).getRegex(),ln=T(Pr,"u").replace(/punct/g,Sr).getRegex(),Ar="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",cn=T(Ar,"gu").replace(/notPunctSpace/g,xr).replace(/punctSpace/g,ft).replace(/punct/g,je).getRegex(),hn=T(Ar,"gu").replace(/notPunctSpace/g,nn).replace(/punctSpace/g,sn).replace(/punct/g,Sr).getRegex(),un=T("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,xr).replace(/punctSpace/g,ft).replace(/punct/g,je).getRegex(),pn=T(/\\(punct)/,"gu").replace(/punct/g,je).getRegex(),dn=T(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),fn=T(pt).replace("(?:-->|$)","-->").getRegex(),gn=T("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",fn).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Me=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,mn=T(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",Me).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Tr=T(/^!?\[(label)\]\[(ref)\]/).replace("label",Me).replace("ref",ut).getRegex(),Cr=T(/^!?\[(ref)\](?:\[\])?/).replace("ref",ut).getRegex(),bn=T("reflink|nolink(?!\\()","g").replace("reflink",Tr).replace("nolink",Cr).getRegex(),gt={_backpedal:be,anyPunctuation:pn,autolink:dn,blockSkip:an,br:_r,code:en,del:be,emStrongLDelim:on,emStrongRDelimAst:cn,emStrongRDelimUnd:un,escape:Js,link:mn,nolink:Cr,punctuation:rn,reflink:Tr,reflinkSearch:bn,tag:gn,text:tn,url:be},yn={...gt,link:T(/^!?\[(label)\]\((.*?)\)/).replace("label",Me).getRegex(),reflink:T(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Me).getRegex()},Ye={...gt,emStrongRDelimAst:hn,emStrongLDelim:ln,url:T(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},wn={...Ye,br:T(_r).replace("{2,}","*").getRegex(),text:T(Ye.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Pe={normal:dt,gfm:Qs,pedantic:Xs},fe={normal:gt,gfm:Ye,breaks:wn,pedantic:yn},vn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Yt=n=>vn[n];function q(n,e){if(e){if(j.escapeTest.test(n))return n.replace(j.escapeReplace,Yt)}else if(j.escapeTestNoEncode.test(n))return n.replace(j.escapeReplaceNoEncode,Yt);return n}function Qt(n){try{n=encodeURI(n).replace(j.percentDecode,"%")}catch{return null}return n}function Xt(n,e){let t=n.replace(j.findPipe,(i,a,o)=>{let h=!1,p=a;for(;--p>=0&&o[p]==="\\";)h=!h;return h?"|":" |"}),s=t.split(j.splitPipe),r=0;if(s[0].trim()||s.shift(),s.length>0&&!s.at(-1)?.trim()&&s.pop(),e)if(s.length>e)s.splice(e);else for(;s.length<e;)s.push("");for(;r<s.length;r++)s[r]=s[r].trim().replace(j.slashPipe,"|");return s}function ge(n,e,t){let s=n.length;if(s===0)return"";let r=0;for(;r<s&&n.charAt(s-r-1)===e;)r++;return n.slice(0,s-r)}function kn(n,e){if(n.indexOf(e[1])===-1)return-1;let t=0;for(let s=0;s<n.length;s++)if(n[s]==="\\")s++;else if(n[s]===e[0])t++;else if(n[s]===e[1]&&(t--,t<0))return s;return t>0?-2:-1}function Jt(n,e,t,s,r){let i=e.href,a=e.title||null,o=n[1].replace(r.other.outputLinkReplace,"$1");s.state.inLink=!0;let h={type:n[0].charAt(0)==="!"?"image":"link",raw:t,href:i,title:a,text:o,tokens:s.inlineTokens(o)};return s.state.inLink=!1,h}function $n(n,e,t){let s=n.match(t.other.indentCodeCompensation);if(s===null)return e;let r=s[1];return e.split(`
`).map(i=>{let a=i.match(t.other.beginningSpace);if(a===null)return i;let[o]=a;return o.length>=r.length?i.slice(r.length):i}).join(`
`)}var Re=class{options;rules;lexer;constructor(n){this.options=n||se}space(n){let e=this.rules.block.newline.exec(n);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(n){let e=this.rules.block.code.exec(n);if(e){let t=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?t:ge(t,`
`)}}}fences(n){let e=this.rules.block.fences.exec(n);if(e){let t=e[0],s=$n(t,e[3]||"",this.rules);return{type:"code",raw:t,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:s}}}heading(n){let e=this.rules.block.heading.exec(n);if(e){let t=e[2].trim();if(this.rules.other.endingHash.test(t)){let s=ge(t,"#");(this.options.pedantic||!s||this.rules.other.endingSpaceChar.test(s))&&(t=s.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(n){let e=this.rules.block.hr.exec(n);if(e)return{type:"hr",raw:ge(e[0],`
`)}}blockquote(n){let e=this.rules.block.blockquote.exec(n);if(e){let t=ge(e[0],`
`).split(`
`),s="",r="",i=[];for(;t.length>0;){let a=!1,o=[],h;for(h=0;h<t.length;h++)if(this.rules.other.blockquoteStart.test(t[h]))o.push(t[h]),a=!0;else if(!a)o.push(t[h]);else break;t=t.slice(h);let p=o.join(`
`),f=p.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");s=s?`${s}
${p}`:p,r=r?`${r}
${f}`:f;let m=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(f,i,!0),this.lexer.state.top=m,t.length===0)break;let v=i.at(-1);if(v?.type==="code")break;if(v?.type==="blockquote"){let _=v,S=_.raw+`
`+t.join(`
`),O=this.blockquote(S);i[i.length-1]=O,s=s.substring(0,s.length-_.raw.length)+O.raw,r=r.substring(0,r.length-_.text.length)+O.text;break}else if(v?.type==="list"){let _=v,S=_.raw+`
`+t.join(`
`),O=this.list(S);i[i.length-1]=O,s=s.substring(0,s.length-v.raw.length)+O.raw,r=r.substring(0,r.length-_.raw.length)+O.raw,t=S.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:s,tokens:i,text:r}}}list(n){let e=this.rules.block.list.exec(n);if(e){let t=e[1].trim(),s=t.length>1,r={type:"list",raw:"",ordered:s,start:s?+t.slice(0,-1):"",loose:!1,items:[]};t=s?`\\d{1,9}\\${t.slice(-1)}`:`\\${t}`,this.options.pedantic&&(t=s?t:"[*+-]");let i=this.rules.other.listItemRegex(t),a=!1;for(;n;){let h=!1,p="",f="";if(!(e=i.exec(n))||this.rules.block.hr.test(n))break;p=e[0],n=n.substring(p.length);let m=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,B=>" ".repeat(3*B.length)),v=n.split(`
`,1)[0],_=!m.trim(),S=0;if(this.options.pedantic?(S=2,f=m.trimStart()):_?S=e[1].length+1:(S=e[2].search(this.rules.other.nonSpaceChar),S=S>4?1:S,f=m.slice(S),S+=e[1].length),_&&this.rules.other.blankLine.test(v)&&(p+=v+`
`,n=n.substring(v.length+1),h=!0),!h){let B=this.rules.other.nextBulletRegex(S),K=this.rules.other.hrRegex(S),_e=this.rules.other.fencesBeginRegex(S),xe=this.rules.other.headingBeginRegex(S),Le=this.rules.other.htmlBeginRegex(S);for(;n;){let ue=n.split(`
`,1)[0],Y;if(v=ue,this.options.pedantic?(v=v.replace(this.rules.other.listReplaceNesting,"  "),Y=v):Y=v.replace(this.rules.other.tabCharGlobal,"    "),_e.test(v)||xe.test(v)||Le.test(v)||B.test(v)||K.test(v))break;if(Y.search(this.rules.other.nonSpaceChar)>=S||!v.trim())f+=`
`+Y.slice(S);else{if(_||m.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||_e.test(m)||xe.test(m)||K.test(m))break;f+=`
`+v}!_&&!v.trim()&&(_=!0),p+=ue+`
`,n=n.substring(ue.length+1),m=Y.slice(S)}}r.loose||(a?r.loose=!0:this.rules.other.doubleBlankLine.test(p)&&(a=!0));let O=null,z;this.options.gfm&&(O=this.rules.other.listIsTask.exec(f),O&&(z=O[0]!=="[ ] ",f=f.replace(this.rules.other.listReplaceTask,""))),r.items.push({type:"list_item",raw:p,task:!!O,checked:z,loose:!1,text:f,tokens:[]}),r.raw+=p}let o=r.items.at(-1);if(o)o.raw=o.raw.trimEnd(),o.text=o.text.trimEnd();else return;r.raw=r.raw.trimEnd();for(let h=0;h<r.items.length;h++)if(this.lexer.state.top=!1,r.items[h].tokens=this.lexer.blockTokens(r.items[h].text,[]),!r.loose){let p=r.items[h].tokens.filter(m=>m.type==="space"),f=p.length>0&&p.some(m=>this.rules.other.anyLine.test(m.raw));r.loose=f}if(r.loose)for(let h=0;h<r.items.length;h++)r.items[h].loose=!0;return r}}html(n){let e=this.rules.block.html.exec(n);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(n){let e=this.rules.block.def.exec(n);if(e){let t=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),s=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",r=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:t,raw:e[0],href:s,title:r}}}table(n){let e=this.rules.block.table.exec(n);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let t=Xt(e[1]),s=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),r=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],i={type:"table",raw:e[0],header:[],align:[],rows:[]};if(t.length===s.length){for(let a of s)this.rules.other.tableAlignRight.test(a)?i.align.push("right"):this.rules.other.tableAlignCenter.test(a)?i.align.push("center"):this.rules.other.tableAlignLeft.test(a)?i.align.push("left"):i.align.push(null);for(let a=0;a<t.length;a++)i.header.push({text:t[a],tokens:this.lexer.inline(t[a]),header:!0,align:i.align[a]});for(let a of r)i.rows.push(Xt(a,i.header.length).map((o,h)=>({text:o,tokens:this.lexer.inline(o),header:!1,align:i.align[h]})));return i}}lheading(n){let e=this.rules.block.lheading.exec(n);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(n){let e=this.rules.block.paragraph.exec(n);if(e){let t=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}}}text(n){let e=this.rules.block.text.exec(n);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(n){let e=this.rules.inline.escape.exec(n);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(n){let e=this.rules.inline.tag.exec(n);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(n){let e=this.rules.inline.link.exec(n);if(e){let t=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(t)){if(!this.rules.other.endAngleBracket.test(t))return;let i=ge(t.slice(0,-1),"\\");if((t.length-i.length)%2===0)return}else{let i=kn(e[2],"()");if(i===-2)return;if(i>-1){let a=(e[0].indexOf("!")===0?5:4)+e[1].length+i;e[2]=e[2].substring(0,i),e[0]=e[0].substring(0,a).trim(),e[3]=""}}let s=e[2],r="";if(this.options.pedantic){let i=this.rules.other.pedanticHrefTitle.exec(s);i&&(s=i[1],r=i[3])}else r=e[3]?e[3].slice(1,-1):"";return s=s.trim(),this.rules.other.startAngleBracket.test(s)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(t)?s=s.slice(1):s=s.slice(1,-1)),Jt(e,{href:s&&s.replace(this.rules.inline.anyPunctuation,"$1"),title:r&&r.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(n,e){let t;if((t=this.rules.inline.reflink.exec(n))||(t=this.rules.inline.nolink.exec(n))){let s=(t[2]||t[1]).replace(this.rules.other.multipleSpaceGlobal," "),r=e[s.toLowerCase()];if(!r){let i=t[0].charAt(0);return{type:"text",raw:i,text:i}}return Jt(t,r,t[0],this.lexer,this.rules)}}emStrong(n,e,t=""){let s=this.rules.inline.emStrongLDelim.exec(n);if(!(!s||s[3]&&t.match(this.rules.other.unicodeAlphaNumeric))&&(!(s[1]||s[2])||!t||this.rules.inline.punctuation.exec(t))){let r=[...s[0]].length-1,i,a,o=r,h=0,p=s[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(p.lastIndex=0,e=e.slice(-1*n.length+r);(s=p.exec(e))!=null;){if(i=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!i)continue;if(a=[...i].length,s[3]||s[4]){o+=a;continue}else if((s[5]||s[6])&&r%3&&!((r+a)%3)){h+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o+h);let f=[...s[0]][0].length,m=n.slice(0,r+s.index+f+a);if(Math.min(r,a)%2){let _=m.slice(1,-1);return{type:"em",raw:m,text:_,tokens:this.lexer.inlineTokens(_)}}let v=m.slice(2,-2);return{type:"strong",raw:m,text:v,tokens:this.lexer.inlineTokens(v)}}}}codespan(n){let e=this.rules.inline.code.exec(n);if(e){let t=e[2].replace(this.rules.other.newLineCharGlobal," "),s=this.rules.other.nonSpaceChar.test(t),r=this.rules.other.startingSpaceChar.test(t)&&this.rules.other.endingSpaceChar.test(t);return s&&r&&(t=t.substring(1,t.length-1)),{type:"codespan",raw:e[0],text:t}}}br(n){let e=this.rules.inline.br.exec(n);if(e)return{type:"br",raw:e[0]}}del(n){let e=this.rules.inline.del.exec(n);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(n){let e=this.rules.inline.autolink.exec(n);if(e){let t,s;return e[2]==="@"?(t=e[1],s="mailto:"+t):(t=e[1],s=t),{type:"link",raw:e[0],text:t,href:s,tokens:[{type:"text",raw:t,text:t}]}}}url(n){let e;if(e=this.rules.inline.url.exec(n)){let t,s;if(e[2]==="@")t=e[0],s="mailto:"+t;else{let r;do r=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(r!==e[0]);t=e[0],e[1]==="www."?s="http://"+e[0]:s=e[0]}return{type:"link",raw:e[0],text:t,href:s,tokens:[{type:"text",raw:t,text:t}]}}}inlineText(n){let e=this.rules.inline.text.exec(n);if(e){let t=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:t}}}},G=class Qe{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||se,this.options.tokenizer=this.options.tokenizer||new Re,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:j,block:Pe.normal,inline:fe.normal};this.options.pedantic?(t.block=Pe.pedantic,t.inline=fe.pedantic):this.options.gfm&&(t.block=Pe.gfm,this.options.breaks?t.inline=fe.breaks:t.inline=fe.gfm),this.tokenizer.rules=t}static get rules(){return{block:Pe,inline:fe}}static lex(e,t){return new Qe(t).lex(e)}static lexInline(e,t){return new Qe(t).inlineTokens(e)}lex(e){e=e.replace(j.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let s=this.inlineQueue[t];this.inlineTokens(s.src,s.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],s=!1){for(this.options.pedantic&&(e=e.replace(j.tabCharGlobal,"    ").replace(j.spaceLine,""));e;){let r;if(this.options.extensions?.block?.some(a=>(r=a.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let a=t.at(-1);r.raw.length===1&&a!==void 0?a.raw+=`
`:t.push(r);continue}if(r=this.tokenizer.code(e)){e=e.substring(r.raw.length);let a=t.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+r.raw,a.text+=`
`+r.text,this.inlineQueue.at(-1).src=a.text):t.push(r);continue}if(r=this.tokenizer.fences(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.heading(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.hr(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.blockquote(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.list(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.html(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(e)){e=e.substring(r.raw.length);let a=t.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+r.raw,a.text+=`
`+r.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title});continue}if(r=this.tokenizer.table(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.lheading(e)){e=e.substring(r.raw.length),t.push(r);continue}let i=e;if(this.options.extensions?.startBlock){let a=1/0,o=e.slice(1),h;this.options.extensions.startBlock.forEach(p=>{h=p.call({lexer:this},o),typeof h=="number"&&h>=0&&(a=Math.min(a,h))}),a<1/0&&a>=0&&(i=e.substring(0,a+1))}if(this.state.top&&(r=this.tokenizer.paragraph(i))){let a=t.at(-1);s&&a?.type==="paragraph"?(a.raw+=`
`+r.raw,a.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):t.push(r),s=i.length!==e.length,e=e.substring(r.raw.length);continue}if(r=this.tokenizer.text(e)){e=e.substring(r.raw.length);let a=t.at(-1);a?.type==="text"?(a.raw+=`
`+r.raw,a.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):t.push(r);continue}if(e){let a="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(a);break}else throw new Error(a)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let s=e,r=null;if(this.tokens.links){let o=Object.keys(this.tokens.links);if(o.length>0)for(;(r=this.tokenizer.rules.inline.reflinkSearch.exec(s))!=null;)o.includes(r[0].slice(r[0].lastIndexOf("[")+1,-1))&&(s=s.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(r=this.tokenizer.rules.inline.anyPunctuation.exec(s))!=null;)s=s.slice(0,r.index)+"++"+s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(r=this.tokenizer.rules.inline.blockSkip.exec(s))!=null;)s=s.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let i=!1,a="";for(;e;){i||(a=""),i=!1;let o;if(this.options.extensions?.inline?.some(p=>(o=p.call({lexer:this},e,t))?(e=e.substring(o.raw.length),t.push(o),!0):!1))continue;if(o=this.tokenizer.escape(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.tag(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.link(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let p=t.at(-1);o.type==="text"&&p?.type==="text"?(p.raw+=o.raw,p.text+=o.text):t.push(o);continue}if(o=this.tokenizer.emStrong(e,s,a)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.codespan(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.br(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.del(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.autolink(e)){e=e.substring(o.raw.length),t.push(o);continue}if(!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),t.push(o);continue}let h=e;if(this.options.extensions?.startInline){let p=1/0,f=e.slice(1),m;this.options.extensions.startInline.forEach(v=>{m=v.call({lexer:this},f),typeof m=="number"&&m>=0&&(p=Math.min(p,m))}),p<1/0&&p>=0&&(h=e.substring(0,p+1))}if(o=this.tokenizer.inlineText(h)){e=e.substring(o.raw.length),o.raw.slice(-1)!=="_"&&(a=o.raw.slice(-1)),i=!0;let p=t.at(-1);p?.type==="text"?(p.raw+=o.raw,p.text+=o.text):t.push(o);continue}if(e){let p="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(p);break}else throw new Error(p)}}return t}},Ie=class{options;parser;constructor(n){this.options=n||se}space(n){return""}code({text:n,lang:e,escaped:t}){let s=(e||"").match(j.notSpaceStart)?.[0],r=n.replace(j.endingNewline,"")+`
`;return s?'<pre><code class="language-'+q(s)+'">'+(t?r:q(r,!0))+`</code></pre>
`:"<pre><code>"+(t?r:q(r,!0))+`</code></pre>
`}blockquote({tokens:n}){return`<blockquote>
${this.parser.parse(n)}</blockquote>
`}html({text:n}){return n}heading({tokens:n,depth:e}){return`<h${e}>${this.parser.parseInline(n)}</h${e}>
`}hr(n){return`<hr>
`}list(n){let e=n.ordered,t=n.start,s="";for(let a=0;a<n.items.length;a++){let o=n.items[a];s+=this.listitem(o)}let r=e?"ol":"ul",i=e&&t!==1?' start="'+t+'"':"";return"<"+r+i+`>
`+s+"</"+r+`>
`}listitem(n){let e="";if(n.task){let t=this.checkbox({checked:!!n.checked});n.loose?n.tokens[0]?.type==="paragraph"?(n.tokens[0].text=t+" "+n.tokens[0].text,n.tokens[0].tokens&&n.tokens[0].tokens.length>0&&n.tokens[0].tokens[0].type==="text"&&(n.tokens[0].tokens[0].text=t+" "+q(n.tokens[0].tokens[0].text),n.tokens[0].tokens[0].escaped=!0)):n.tokens.unshift({type:"text",raw:t+" ",text:t+" ",escaped:!0}):e+=t+" "}return e+=this.parser.parse(n.tokens,!!n.loose),`<li>${e}</li>
`}checkbox({checked:n}){return"<input "+(n?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:n}){return`<p>${this.parser.parseInline(n)}</p>
`}table(n){let e="",t="";for(let r=0;r<n.header.length;r++)t+=this.tablecell(n.header[r]);e+=this.tablerow({text:t});let s="";for(let r=0;r<n.rows.length;r++){let i=n.rows[r];t="";for(let a=0;a<i.length;a++)t+=this.tablecell(i[a]);s+=this.tablerow({text:t})}return s&&(s=`<tbody>${s}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+s+`</table>
`}tablerow({text:n}){return`<tr>
${n}</tr>
`}tablecell(n){let e=this.parser.parseInline(n.tokens),t=n.header?"th":"td";return(n.align?`<${t} align="${n.align}">`:`<${t}>`)+e+`</${t}>
`}strong({tokens:n}){return`<strong>${this.parser.parseInline(n)}</strong>`}em({tokens:n}){return`<em>${this.parser.parseInline(n)}</em>`}codespan({text:n}){return`<code>${q(n,!0)}</code>`}br(n){return"<br>"}del({tokens:n}){return`<del>${this.parser.parseInline(n)}</del>`}link({href:n,title:e,tokens:t}){let s=this.parser.parseInline(t),r=Qt(n);if(r===null)return s;n=r;let i='<a href="'+n+'"';return e&&(i+=' title="'+q(e)+'"'),i+=">"+s+"</a>",i}image({href:n,title:e,text:t,tokens:s}){s&&(t=this.parser.parseInline(s,this.parser.textRenderer));let r=Qt(n);if(r===null)return q(t);n=r;let i=`<img src="${n}" alt="${t}"`;return e&&(i+=` title="${q(e)}"`),i+=">",i}text(n){return"tokens"in n&&n.tokens?this.parser.parseInline(n.tokens):"escaped"in n&&n.escaped?n.text:q(n.text)}},mt=class{strong({text:n}){return n}em({text:n}){return n}codespan({text:n}){return n}del({text:n}){return n}html({text:n}){return n}text({text:n}){return n}link({text:n}){return""+n}image({text:n}){return""+n}br(){return""}},Z=class Xe{options;renderer;textRenderer;constructor(e){this.options=e||se,this.options.renderer=this.options.renderer||new Ie,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new mt}static parse(e,t){return new Xe(t).parse(e)}static parseInline(e,t){return new Xe(t).parseInline(e)}parse(e,t=!0){let s="";for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let o=i,h=this.options.extensions.renderers[o.type].call({parser:this},o);if(h!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(o.type)){s+=h||"";continue}}let a=i;switch(a.type){case"space":{s+=this.renderer.space(a);continue}case"hr":{s+=this.renderer.hr(a);continue}case"heading":{s+=this.renderer.heading(a);continue}case"code":{s+=this.renderer.code(a);continue}case"table":{s+=this.renderer.table(a);continue}case"blockquote":{s+=this.renderer.blockquote(a);continue}case"list":{s+=this.renderer.list(a);continue}case"html":{s+=this.renderer.html(a);continue}case"paragraph":{s+=this.renderer.paragraph(a);continue}case"text":{let o=a,h=this.renderer.text(o);for(;r+1<e.length&&e[r+1].type==="text";)o=e[++r],h+=`
`+this.renderer.text(o);t?s+=this.renderer.paragraph({type:"paragraph",raw:h,text:h,tokens:[{type:"text",raw:h,text:h,escaped:!0}]}):s+=h;continue}default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return s}parseInline(e,t=this.renderer){let s="";for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let o=this.options.extensions.renderers[i.type].call({parser:this},i);if(o!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){s+=o||"";continue}}let a=i;switch(a.type){case"escape":{s+=t.text(a);break}case"html":{s+=t.html(a);break}case"link":{s+=t.link(a);break}case"image":{s+=t.image(a);break}case"strong":{s+=t.strong(a);break}case"em":{s+=t.em(a);break}case"codespan":{s+=t.codespan(a);break}case"br":{s+=t.br(a);break}case"del":{s+=t.del(a);break}case"text":{s+=t.text(a);break}default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return s}},Te=class{options;block;constructor(n){this.options=n||se}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(n){return n}postprocess(n){return n}processAllTokens(n){return n}provideLexer(){return this.block?G.lex:G.lexInline}provideParser(){return this.block?Z.parse:Z.parseInline}},_n=class{defaults=lt();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=Z;Renderer=Ie;TextRenderer=mt;Lexer=G;Tokenizer=Re;Hooks=Te;constructor(...n){this.use(...n)}walkTokens(n,e){let t=[];for(let s of n)switch(t=t.concat(e.call(this,s)),s.type){case"table":{let r=s;for(let i of r.header)t=t.concat(this.walkTokens(i.tokens,e));for(let i of r.rows)for(let a of i)t=t.concat(this.walkTokens(a.tokens,e));break}case"list":{let r=s;t=t.concat(this.walkTokens(r.items,e));break}default:{let r=s;this.defaults.extensions?.childTokens?.[r.type]?this.defaults.extensions.childTokens[r.type].forEach(i=>{let a=r[i].flat(1/0);t=t.concat(this.walkTokens(a,e))}):r.tokens&&(t=t.concat(this.walkTokens(r.tokens,e)))}}return t}use(...n){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return n.forEach(t=>{let s={...t};if(s.async=this.defaults.async||s.async||!1,t.extensions&&(t.extensions.forEach(r=>{if(!r.name)throw new Error("extension name required");if("renderer"in r){let i=e.renderers[r.name];i?e.renderers[r.name]=function(...a){let o=r.renderer.apply(this,a);return o===!1&&(o=i.apply(this,a)),o}:e.renderers[r.name]=r.renderer}if("tokenizer"in r){if(!r.level||r.level!=="block"&&r.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let i=e[r.level];i?i.unshift(r.tokenizer):e[r.level]=[r.tokenizer],r.start&&(r.level==="block"?e.startBlock?e.startBlock.push(r.start):e.startBlock=[r.start]:r.level==="inline"&&(e.startInline?e.startInline.push(r.start):e.startInline=[r.start]))}"childTokens"in r&&r.childTokens&&(e.childTokens[r.name]=r.childTokens)}),s.extensions=e),t.renderer){let r=this.defaults.renderer||new Ie(this.defaults);for(let i in t.renderer){if(!(i in r))throw new Error(`renderer '${i}' does not exist`);if(["options","parser"].includes(i))continue;let a=i,o=t.renderer[a],h=r[a];r[a]=(...p)=>{let f=o.apply(r,p);return f===!1&&(f=h.apply(r,p)),f||""}}s.renderer=r}if(t.tokenizer){let r=this.defaults.tokenizer||new Re(this.defaults);for(let i in t.tokenizer){if(!(i in r))throw new Error(`tokenizer '${i}' does not exist`);if(["options","rules","lexer"].includes(i))continue;let a=i,o=t.tokenizer[a],h=r[a];r[a]=(...p)=>{let f=o.apply(r,p);return f===!1&&(f=h.apply(r,p)),f}}s.tokenizer=r}if(t.hooks){let r=this.defaults.hooks||new Te;for(let i in t.hooks){if(!(i in r))throw new Error(`hook '${i}' does not exist`);if(["options","block"].includes(i))continue;let a=i,o=t.hooks[a],h=r[a];Te.passThroughHooks.has(i)?r[a]=p=>{if(this.defaults.async)return Promise.resolve(o.call(r,p)).then(m=>h.call(r,m));let f=o.call(r,p);return h.call(r,f)}:r[a]=(...p)=>{let f=o.apply(r,p);return f===!1&&(f=h.apply(r,p)),f}}s.hooks=r}if(t.walkTokens){let r=this.defaults.walkTokens,i=t.walkTokens;s.walkTokens=function(a){let o=[];return o.push(i.call(this,a)),r&&(o=o.concat(r.call(this,a))),o}}this.defaults={...this.defaults,...s}}),this}setOptions(n){return this.defaults={...this.defaults,...n},this}lexer(n,e){return G.lex(n,e??this.defaults)}parser(n,e){return Z.parse(n,e??this.defaults)}parseMarkdown(n){return(e,t)=>{let s={...t},r={...this.defaults,...s},i=this.onError(!!r.silent,!!r.async);if(this.defaults.async===!0&&s.async===!1)return i(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return i(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return i(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));r.hooks&&(r.hooks.options=r,r.hooks.block=n);let a=r.hooks?r.hooks.provideLexer():n?G.lex:G.lexInline,o=r.hooks?r.hooks.provideParser():n?Z.parse:Z.parseInline;if(r.async)return Promise.resolve(r.hooks?r.hooks.preprocess(e):e).then(h=>a(h,r)).then(h=>r.hooks?r.hooks.processAllTokens(h):h).then(h=>r.walkTokens?Promise.all(this.walkTokens(h,r.walkTokens)).then(()=>h):h).then(h=>o(h,r)).then(h=>r.hooks?r.hooks.postprocess(h):h).catch(i);try{r.hooks&&(e=r.hooks.preprocess(e));let h=a(e,r);r.hooks&&(h=r.hooks.processAllTokens(h)),r.walkTokens&&this.walkTokens(h,r.walkTokens);let p=o(h,r);return r.hooks&&(p=r.hooks.postprocess(p)),p}catch(h){return i(h)}}}onError(n,e){return t=>{if(t.message+=`
Please report this to https://github.com/markedjs/marked.`,n){let s="<p>An error occurred:</p><pre>"+q(t.message+"",!0)+"</pre>";return e?Promise.resolve(s):s}if(e)return Promise.reject(t);throw t}}},re=new _n;function C(n,e){return re.parse(n,e)}C.options=C.setOptions=function(n){return re.setOptions(n),C.defaults=re.defaults,wr(C.defaults),C};C.getDefaults=lt;C.defaults=se;C.use=function(...n){return re.use(...n),C.defaults=re.defaults,wr(C.defaults),C};C.walkTokens=function(n,e){return re.walkTokens(n,e)};C.parseInline=re.parseInline;C.Parser=Z;C.parser=Z.parse;C.Renderer=Ie;C.TextRenderer=mt;C.Lexer=G;C.lexer=G.lex;C.Tokenizer=Re;C.Hooks=Te;C.parse=C;C.options;C.setOptions;C.use;C.walkTokens;C.parseInline;Z.parse;G.lex;const xn=`## Unifying Playable Ads: The CTA SDK Bridge\r
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
`;var Sn=Object.getOwnPropertyDescriptor,Pn=(n,e,t,s)=>{for(var r=s>1?void 0:s?Sn(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let er=class extends L{constructor(){super(...arguments),this.markdownHtml=""}connectedCallback(){super.connectedCallback();const n=C.parse(xn);typeof n=="string"&&(this.markdownHtml=n),this.requestUpdate()}render(){return A`
      <div class="cta-sdk-info">
        <div>${Hs(this.markdownHtml)}</div>
      </div>
    `}};er=Pn([H("cta-sdk-page"),he("/cta-sdk",{title:"CTA SDK Documentation",description:"Documentation for the CTA SDK, providing guidance on how to integrate and use the SDK in your playable ads."})],er);var An=Object.getOwnPropertyDescriptor,Tn=(n,e,t,s)=>{for(var r=s>1?void 0:s?An(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let tr=class extends L{render(){return A`
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
    `}};tr=Tn([H("home-page"),he("/",{title:"Playable Tools for HTML5 Ads",description:"A collection of open-source tools for HTML5 playable ads developers, including publishing, asset compression, and validation."})],tr);const Cn="modulepreload",En=function(n){return"/PlayableTools/"+n},rr={},On=function(e,t,s){let r=Promise.resolve();if(t&&t.length>0){let h=function(p){return Promise.all(p.map(f=>Promise.resolve(f).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),o=a?.nonce||a?.getAttribute("nonce");r=h(t.map(p=>{if(p=En(p),p in rr)return;rr[p]=!0;const f=p.endsWith(".css"),m=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${p}"]${m}`))return;const v=document.createElement("link");if(v.rel=f?"stylesheet":Cn,f||(v.as="script"),v.crossOrigin="",v.href=p,o&&v.setAttribute("nonce",o),document.head.appendChild(v),f)return new Promise((_,S)=>{v.addEventListener("load",_),v.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${p}`)))})}))}function i(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return r.then(a=>{for(const o of a||[])o.status==="rejected"&&i(o.reason);return e().catch(i)})};class Je{static getBaseDir(){const e=window.location.origin+window.location.pathname.replace(/([?#].*)$/,"");return e.endsWith("/")?e:e+"/"}static buildFetchUrl(e,t){return this.getBaseDir()+e+t}}const Mn={replaceTokens:{'<script type="module" crossorigin>':"<script>"}},Rn=[{Name:"Facebook",InjeectScripts:["cta.Facebook.js"]},{Name:"Moloco",InjeectScripts:["cta.Moloco.js"],replaceTokens:{XMLHttpRequest:"XRQ"}},{Name:"Facebook_Zip",format:"zip",ExtractScripts:!0,InjeectScripts:["cta.Facebook_Zip.js"]},{Name:"Mintegral",format:"zip",OutputIndexHtmlName:"%name%.html",InjeectScripts:["cta.Mintegral.js"]},{Name:"IronSource",InjeectScripts:["cta.IronSource.js"]},{Name:"AdColony",InjeectScripts:["cta.AdColony.js"]},{Name:"Unity",InjeectScripts:["cta.Unity.js"]},{Name:"Applovin",InjeectScripts:["cta.Applovin.js"]},{Name:"liftoff",InjeectScripts:["cta.Mraid2.js"]},{Name:"chartboost",InjeectScripts:["cta.Mraid2.js"]},{Name:"Vungle",OutputIndexHtmlName:"ad.html",format:"zip",ExtraFiles:[{from:"./Vungle/index.html",to:"./index.html"}],InjeectScripts:["cta.Vungle.js"]},{Name:"TikTok",format:"zip",OutputIndexHtmlName:"index.html",ExtraFiles:[{from:"./TikTok/config.json",to:"./config.json"}],InjeectScripts:["cta.TikTok.js"]},{Name:"Google",OutputIndexHtmlName:"index.html",format:"zip",Sizes:{"320x480":"width=320,height=480","480x320":"width=480,height=320","300x250":"width=300,height=250"},InjeectScripts:["cta.Google.js"],replaceTokens:{"</title>":'</title> <meta name="ad.size" content="{{ad.size}}"><meta name="ad.orientation" content="landscape">'}}],In={globalDefaults:Mn,platforms:Rn};var Dn=Object.getOwnPropertyDescriptor,Un=(n,e,t,s)=>{for(var r=s>1?void 0:s?Dn(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let et=class{constructor(){this.config=[],this.globalDefaults={},this.loadConfig(In)}loadConfig(n){if(Array.isArray(n.platforms))this.config=n.platforms,n.globalDefaults&&typeof n.globalDefaults=="object"&&(this.globalDefaults=n.globalDefaults),console.log("PlayablePublishService: Loaded platforms config:",this.config);else throw new Error("Invalid config: platforms array missing")}getPlatforms(){return this.config}getAvailablePlatforms(){return this.config.map(n=>n.Name)}async processHtml(n,e,t){const s=this.config.find(o=>o.Name===e);if(!s)throw new Error(`Platform '${e}' not found in config`);let r=n,i=performance.now();s.replaceTokens&&(r=this.applyReplaceTokens(r,s.replaceTokens));let a=performance.now();if(console.log(`[PlayablePublishService] Platform replaceTokens (${e}): ${(a-i).toFixed(2)} ms`),s.InjeectScripts&&Array.isArray(s.InjeectScripts)){let o=performance.now();r=await this.injectScripts(r,s.InjeectScripts);let h=performance.now();console.log(`[PlayablePublishService] Script injection (${e}): ${(h-o).toFixed(2)} ms`)}return s.OutputIndexHtmlName&&t?.name,r}applyReplaceTokens(n,e){if(!e||Object.keys(e).length===0)return n;const t=Object.keys(e).map(r=>r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),s=new RegExp(t.join("|"),"g");return n.replace(s,r=>e[r]??r)}async injectScripts(n,e){let t=n;const s=e.map(async i=>{try{const a=Je.buildFetchUrl("publish-data/",i),o=await fetch(a);return o.ok?`<script>
${await o.text()}
<\/script>`:(console.warn(`Could not load script: ${i} from ${a}`),null)}catch(a){return console.warn(`Failed to inject script ${i}:`,a),null}}),r=(await Promise.all(s)).filter(Boolean);for(const i of r)if(/<head[^>]*>/i.test(t)){const a=t.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);if(a){const o=a[2],h=o.match(/<script[^>]*>/i);if(h){const p=a.index+a[1].length+o.indexOf(h[0]);t=t.slice(0,p)+`
${i}
`+t.slice(p)}else t=t.replace(/<\/head>/i,`${i}
</head>`)}}else/<\/body>/i.test(t)?t=t.replace(/<\/body>/i,`${i}
</body>`):t=t+i;return t}async processAllPlatforms(n,e){if(!e.outputDirectory)throw new Error("Output directory is required");const t=e.name||"Playable",s=e.suffix||"EN";let r=n,i=performance.now();this.globalDefaults.replaceTokens&&(r=this.applyReplaceTokens(r,this.globalDefaults.replaceTokens));let a=performance.now();console.log(`[PlayablePublishService] Global replaceTokens: ${(a-i).toFixed(2)} ms`);let o=this.config;e.selectedPlatforms&&Array.isArray(e.selectedPlatforms)&&e.selectedPlatforms.length>0&&(o=this.config.filter(f=>e.selectedPlatforms.includes(f.Name)));const h=o.length;let p=0;for(const f of o){const m=await this.createPlatformDirectory(e.outputDirectory,f.Name),v=await this.processHtml(r,f.Name,e),_=this.generateFileName(t,f.Name,s,f);f.format==="zip"?await this.createZipPackageToDirectory(v,_,m,f):await this.saveHtmlFileToDirectory(v,_,m),p++;const S=30+p/h*70;e.onProgress?.(S,f.Name)}}generateFileName(n,e,t,s){return s.OutputIndexHtmlName?s.OutputIndexHtmlName.includes("%name%")?s.OutputIndexHtmlName.replace("%name%",n):s.OutputIndexHtmlName:`${n}_${e}_${t}.html`}async createPlatformDirectory(n,e){try{const t=await n.getDirectoryHandle(e,{create:!0});return console.log(`Created/accessed directory: ${e}`),t}catch(t){throw new Error(`Failed to create platform directory ${e}: ${t}`)}}async saveHtmlFileToDirectory(n,e,t){let s=performance.now();try{const a=await(await t.getFileHandle(e,{create:!0})).createWritable();await a.write(n),await a.close();const o=(n.length/1024).toFixed(2);console.log(`Saved HTML file: ${e} (${o} KB)`)}catch(i){throw new Error(`Failed to save HTML file ${e}: ${i}`)}let r=performance.now();console.log(`[PlayablePublishService] Save HTML (${e}): ${(r-s).toFixed(2)} ms`)}async createZipPackageToDirectory(n,e,t,s){try{const r=(await On(async()=>{const{default:O}=await import("./jszip.min-CMxDDm-u.js").then(z=>z.j);return{default:O}},[])).default,i=new r;if(i.file(e,n),s.ExtraFiles)for(const O of s.ExtraFiles)try{const z=`/publish-data/${O.from.replace("./","")}`,B=await fetch(z);if(B.ok){const K=await B.text();i.file(O.to.replace("./",""),K)}else console.warn(`Could not load extra file from: ${z}`)}catch(z){console.warn(`Could not load extra file: ${O.from}`,z)}let a=performance.now();const o=await i.generateAsync({type:"blob"});let h=performance.now();console.log(`[PlayablePublishService] Zipping (${e}): ${(h-a).toFixed(2)} ms`);let p=performance.now();const f=e.replace(".html",".zip"),v=await(await t.getFileHandle(f,{create:!0})).createWritable();await v.write(o),await v.close();let _=performance.now();console.log(`[PlayablePublishService] Save ZIP (${f}): ${(_-p).toFixed(2)} ms`);const S=(o.size/1024).toFixed(2);console.log(`Saved ZIP file: ${f} (${S} KB)`)}catch(r){throw new Error(`Failed to create ZIP package ${e}: ${r}`)}}async requestOutputDirectory(){if("showDirectoryPicker"in window)try{const n=await window.showDirectoryPicker();return console.log(`Selected output directory: ${n.name}`),n}catch(n){throw n instanceof Error&&n.name==="AbortError"?new Error("Directory selection was cancelled"):new Error(`Failed to select directory: ${n}`)}else throw new Error("File System Access API is not supported in this browser. Please use Chrome, Edge, or another supported browser.")}};et=Un([cr(ae.Singleton)],et);var zn=Object.defineProperty,jn=(n,e,t,s)=>{for(var r=void 0,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(e,t,r)||r);return r&&zn(e,t,r),r};class Er extends L{constructor(){super(...arguments),this.dragActive=!1,this.loadedFile=null,this.isPublishing=!1,this.publishProgress=0,this.currentPlatform=null,this.publishStartTime=null,this.publishElapsed=null,this.playableTitle="",this.googlePlayUrl="",this.appStoreUrl="",this.customSuffix="EN",this.outputDirectory="",this.availablePlatforms=[],this.selectedPlatforms=[],this.STORAGE_KEYS={playableTitle:"playable-publisher-title",googlePlayUrl:"playable-publisher-google-url",appStoreUrl:"playable-publisher-app-store-url",customSuffix:"playable-publisher-suffix",selectedPlatforms:"playable-publisher-selected-platforms"}}connectedCallback(){super.connectedCallback(),this.loadFromLocalStorage(),this.playablePublishService&&typeof this.playablePublishService.getAvailablePlatforms=="function"&&(this.availablePlatforms=this.playablePublishService.getAvailablePlatforms(),(!this.selectedPlatforms||this.selectedPlatforms.length===0)&&(this.selectedPlatforms=[...this.availablePlatforms]))}render(){return A`
      <div class="playable-publisher">
        <div style="margin-bottom:1.5rem">
          <strong>Publish Playable Ad</strong><br />
          <small>
            Use this tool to upload your playable ad HTML file and prepare it
            for different platforms.<br />
            Drop your .html file below or select it manually.
          </small>
        </div>

        ${this.loadedFile?A`
              <div class="file-loaded-info">
                <strong>File loaded:</strong> ${this.loadedFile.name}
                (${(this.loadedFile.size/1024).toFixed(2)} KB)

                ${this.isPublishing?A`
                      <div class="progress-container">
                        <div class="progress-text">
                          Publishing... ${Math.round(this.publishProgress)}%
                          ${this.currentPlatform?A`<span style="margin-left:1em;">(${this.currentPlatform})</span>`:""}
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
            `:A`
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
        ${this.loadedFile?A`
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
                  ${this.availablePlatforms.map(e=>A`
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
          ${this.loadedFile&&this.playableTitle&&!this.isPublishing?A`
            <button 
              @click=${this._publishPlayable}
              style="margin-right: 0.5rem;"
              ?disabled=${!this.selectedPlatforms.length}
            >
              Publish
            </button>
          `:null}
          ${this.loadedFile&&!this.isPublishing?A`
            <button 
              @click=${this._resetFile}
            >
              Cancel
            </button>
          `:null}
        </div>
      </div>
    `}_onPlatformCheckboxChange(e,t){e.target.checked?this.selectedPlatforms.includes(t)||(this.selectedPlatforms=[...this.selectedPlatforms,t]):this.selectedPlatforms=this.selectedPlatforms.filter(r=>r!==t),this.saveToLocalStorage(),this.requestUpdate()}_selectAllPlatforms(e){e.preventDefault(),this.selectedPlatforms=[...this.availablePlatforms],this.saveToLocalStorage(),this.requestUpdate()}_clearAllPlatforms(e){e.preventDefault(),this.selectedPlatforms=[],this.saveToLocalStorage(),this.requestUpdate()}_onDragOver(e){e.preventDefault(),this.dragActive=!0,this.requestUpdate()}_onDragLeave(e){e.preventDefault(),this.dragActive=!1,this.requestUpdate()}_onDrop(e){e.preventDefault(),this.dragActive=!1,this.requestUpdate();const t=e.dataTransfer?.files;t&&t.length&&this._processFile(t[0])}_onFileChange(e){const s=e.target.files?.[0];s&&this._processFile(s)}_processFile(e){if(e&&e.name.endsWith(".html")){this.loadedFile=e,this.requestUpdate();const t=new CustomEvent("file-selected",{detail:e});this.dispatchEvent(t)}else alert("Please select a valid .html file.")}_resetFile(){this.loadedFile=null,this.requestUpdate()}async _publishPlayable(){if(!this.loadedFile||!this.playableTitle){alert("Please provide a playable title and select a file.");return}if(!this.selectedPlatforms||this.selectedPlatforms.length===0){alert("Please select at least one platform to publish.");return}try{this.isPublishing=!0,this.publishProgress=0,this.currentPlatform=null,this.publishElapsed=null,this.requestUpdate(),this.publishProgress=10,this.requestUpdate();const e=await this.playablePublishService.requestOutputDirectory();this.publishStartTime=Date.now(),this.publishProgress=20,this.requestUpdate();const t=await this._readFileContent(this.loadedFile),s={name:this.playableTitle,title:this.playableTitle,googlePlayUrl:this.googlePlayUrl,appStoreUrl:this.appStoreUrl,suffix:this.customSuffix,outputDirectory:e,onProgress:(r,i)=>{this.publishProgress=r,i&&(this.currentPlatform=i),this.requestUpdate()},selectedPlatforms:[...this.selectedPlatforms]};if(this.publishProgress=30,this.requestUpdate(),await this.playablePublishService.processAllPlatforms(t,s),this.publishProgress=100,this.currentPlatform=null,this.publishStartTime){const r=Date.now()-this.publishStartTime;this.publishElapsed=this._formatElapsed(r)}this.requestUpdate(),setTimeout(()=>{let r="Publishing completed successfully! Files have been saved to the selected directory with subfolders for each platform.";this.publishElapsed&&(r+=`

Elapsed time: ${this.publishElapsed}`),alert(r),this.isPublishing=!1,this.publishProgress=0,this.publishElapsed=null,this.publishStartTime=null,this.requestUpdate()},500)}catch(e){console.error("Publishing failed:",e);let t=e instanceof Error?e.message:"Unknown error";t.includes("File System Access API is not supported")&&(t+=`

For best results, please use Chrome 86+, Edge 86+, or another browser that supports the File System Access API.`),alert(`Publishing failed: ${t}`),this.isPublishing=!1,this.publishProgress=0,this.requestUpdate()}}_formatElapsed(e){const t=Math.floor(e/1e3),s=Math.floor(t/60),r=t%60;return s>0?`${s}m ${r}s`:`${r}s`}_readFileContent(e){return new Promise((t,s)=>{const r=new FileReader;r.onload=i=>{const a=i.target?.result;typeof a=="string"?t(a):s(new Error("Failed to read file as text"))},r.onerror=()=>s(new Error("Failed to read file")),r.readAsText(e)})}loadFromLocalStorage(){this.playableTitle=localStorage.getItem(this.STORAGE_KEYS.playableTitle)||"",this.googlePlayUrl=localStorage.getItem(this.STORAGE_KEYS.googlePlayUrl)||"",this.appStoreUrl=localStorage.getItem(this.STORAGE_KEYS.appStoreUrl)||"",this.customSuffix=localStorage.getItem(this.STORAGE_KEYS.customSuffix)||"EN";const e=localStorage.getItem(this.STORAGE_KEYS.selectedPlatforms);if(e)try{const t=JSON.parse(e);Array.isArray(t)&&(this.selectedPlatforms=t)}catch{}this.requestUpdate()}saveToLocalStorage(){localStorage.setItem(this.STORAGE_KEYS.playableTitle,this.playableTitle),localStorage.setItem(this.STORAGE_KEYS.googlePlayUrl,this.googlePlayUrl),localStorage.setItem(this.STORAGE_KEYS.appStoreUrl,this.appStoreUrl),localStorage.setItem(this.STORAGE_KEYS.customSuffix,this.customSuffix),localStorage.setItem(this.STORAGE_KEYS.selectedPlatforms,JSON.stringify(this.selectedPlatforms))}updateField(e,t){switch(e){case"playableTitle":this.playableTitle=t;break;case"googlePlayUrl":this.googlePlayUrl=t;break;case"appStoreUrl":this.appStoreUrl=t;break;case"customSuffix":this.customSuffix=t;break}this.saveToLocalStorage(),this.requestUpdate()}}jn([hr(et)],Er.prototype,"playablePublishService");customElements.define("playable-publisher",Er);var Ln=Object.getOwnPropertyDescriptor,Hn=(n,e,t,s)=>{for(var r=s>1?void 0:s?Ln(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let sr=class extends L{render(){return A`
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
    `}};sr=Hn([H("publish-page"),he("/publish",{title:"Publish Playable Ads",description:"Publish your playable ads to multiple ad networks with ease. This tool streamlines the process of deploying your ads."})],sr);var Bn=Object.getOwnPropertyDescriptor,Fn=(n,e,t,s)=>{for(var r=s>1?void 0:s?Bn(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let nr=class extends L{render(){return A`
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
    `}};nr=Fn([H("validate-page"),he("/validate",{title:"Ad Network Technical Requirements",description:"A comprehensive guide to the technical requirements for major ad networks, including file size limits and validation tools."})],nr);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Nn=n=>n??I;var qn=Object.getOwnPropertyDescriptor,Gn=(n,e,t,s)=>{for(var r=s>1?void 0:s?qn(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let ir=class extends L{constructor(){super(...arguments),this.menuItems=[{label:"Home",path:"/",disabled:!1},{label:"CTA SDK",path:"/cta-sdk",disabled:!1},{label:"Publish",path:"/publish",disabled:!1},{label:"Validate",path:"/validate",disabled:!1},{label:"Compress assets",path:"/compress-assets",disabled:!1},{label:"Base64 Converter",path:"/base64",disabled:!1},{label:"FAQ",path:"/faq",disabled:!0}],this.handleHashChange=()=>{this.requestUpdate()}}get currentPath(){let n=window.location.hash?window.location.hash.substring(1):"";return n.startsWith("/")||(n="/"+n),n}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleHashChange)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleHashChange)}render(){return A`
      <nav aria-label="Main menu">
        <ul>
          ${this.menuItems.map(n=>{const e=this.currentPath===n.path;return A`
              <li>
                <a
                  href=${Nn(n.disabled?void 0:`#${n.path.substring(1)}`)}
                  class="${e?"active":""} ${n.disabled?"disabled":""}"
                  tabindex="${n.disabled?-1:0}"
                  aria-disabled="${n.disabled}"
                  title=${n.disabled?"Coming soon":""}
                  ...=${e?{"aria-current":"page"}:{}}
                  @click=${n.disabled?t=>t.preventDefault():void 0}
                >
                  ${n.label}
                </a>
              </li>
            `})}
        </ul>
      </nav>
    `}};ir=Gn([H("nav-menu")],ir);var Zn=Object.getOwnPropertyDescriptor,Wn=(n,e,t,s)=>{for(var r=s>1?void 0:s?Zn(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let ar=class extends L{render(){return A`
      <a href="${Je.getBaseDir()}" class="site-logo-link">
        <img
          src="${Je.buildFetchUrl("","small-logo.jpg")}"
          alt="Logo"
          class="site-logo-img"
        />
        <span class="site-logo-title">
          <div class="site-logo-subheader">Gritsenko</div>
          Playable Ads Tools
        </span>
      </a>
    `}};ar=Wn([H("site-logo")],ar);var Vn=Object.defineProperty,Kn=Object.getOwnPropertyDescriptor,bt=(n,e,t,s)=>{for(var r=s>1?void 0:s?Kn(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=(s?a(e,t,r):a(r))||r);return s&&r&&Vn(e,t,r),r};let ve=class extends Ts{constructor(){super(...arguments),this.sidebarOpen=!1,this.deferredPrompt=null}toggleSidebar(){this.sidebarOpen=!this.sidebarOpen}closeSidebar(){this.sidebarOpen=!1}connectedCallback(){super.connectedCallback(),window.addEventListener("beforeinstallprompt",n=>{const e=n;e.preventDefault(),this.deferredPrompt=e})}suggestPWAInstall(){this.deferredPrompt?(this.deferredPrompt.prompt(),this.deferredPrompt.userChoice.then(n=>{n.outcome==="accepted"?console.log("User accepted the install prompt"):console.log("User dismissed the install prompt"),this.deferredPrompt=null})):alert("The install prompt is not available. Please use the browser menu to install the app.")}render(){return A`
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
    `}};bt([V({attribute:!1,type:Object})],ve.prototype,"body",2);bt([V({type:Boolean})],ve.prototype,"sidebarOpen",2);ve=bt([H("main-layout")],ve);var Yn=Object.getOwnPropertyDescriptor,Qn=(n,e,t,s)=>{for(var r=s>1?void 0:s?Yn(e,t):e,i=n.length-1,a;i>=0;i--)(a=n[i])&&(r=a(r)||r);return r};let or=class extends L{render(){return A`
      <router-outlet .defaultLayout="${ve}"></router-outlet>
    `}};or=Qn([H("app-root")],or);export{Lt as c,ei as g};
