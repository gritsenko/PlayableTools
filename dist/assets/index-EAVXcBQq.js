(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function t(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(r){if(r.ep)return;r.ep=!0;const n=t(r);fetch(r.href,n)}})();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const q=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ae=globalThis,be=ae.ShadowRoot&&(ae.ShadyCSS===void 0||ae.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ht=Symbol(),Ge=new WeakMap;let Bt=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==ht)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(be&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=Ge.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&Ge.set(t,e))}return e}toString(){return this.cssText}};const Gt=i=>new Bt(typeof i=="string"?i:i+"",void 0,ht),Vt=(i,e)=>{if(be)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),r=ae.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,i.appendChild(s)}},Ve=be?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return Gt(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Wt,defineProperty:Zt,getOwnPropertyDescriptor:Yt,getOwnPropertyNames:Jt,getOwnPropertySymbols:Kt,getPrototypeOf:Qt}=Object,he=globalThis,We=he.trustedTypes,Xt=We?We.emptyScript:"",er=he.reactiveElementPolyfillSupport,K=(i,e)=>i,ne={toAttribute(i,e){switch(e){case Boolean:i=i?Xt:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},_e=(i,e)=>!Wt(i,e),Ze={attribute:!0,type:String,converter:ne,reflect:!1,useDefault:!1,hasChanged:_e};Symbol.metadata??=Symbol("metadata"),he.litPropertyMetadata??=new WeakMap;let G=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Ze){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),r=this.getPropertyDescriptor(e,s,t);r!==void 0&&Zt(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){const{get:r,set:n}=Yt(this.prototype,e)??{get(){return this[t]},set(c){this[t]=c}};return{get:r,set(c){const p=r?.call(this);n?.call(this,c),this.requestUpdate(e,p,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ze}static _$Ei(){if(this.hasOwnProperty(K("elementProperties")))return;const e=Qt(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(K("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(K("properties"))){const t=this.properties,s=[...Jt(t),...Kt(t)];for(const r of s)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,r]of t)this.elementProperties.set(s,r)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const r=this._$Eu(t,s);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)t.unshift(Ve(r))}else e!==void 0&&t.push(Ve(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Vt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,s);if(r!==void 0&&s.reflect===!0){const n=(s.converter?.toAttribute!==void 0?s.converter:ne).toAttribute(t,s.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const s=this.constructor,r=s._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const n=s.getPropertyOptions(r),c=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:ne;this._$Em=r;const p=c.fromAttribute(t,n.type);this[r]=p??this._$Ej?.get(r)??p,this._$Em=null}}requestUpdate(e,t,s){if(e!==void 0){const r=this.constructor,n=this[e];if(s??=r.getPropertyOptions(e),!((s.hasChanged??_e)(n,t)||s.useDefault&&s.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:r,wrapped:n},c){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,c??t??this[e]),n!==!0||c!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,n]of s){const{wrapped:c}=n,p=this[r];c!==!0||this._$AL.has(r)||p===void 0||this.C(r,void 0,n,p)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};G.elementStyles=[],G.shadowRootOptions={mode:"open"},G[K("elementProperties")]=new Map,G[K("finalized")]=new Map,er?.({ReactiveElement:G}),(he.reactiveElementVersions??=[]).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const tr={attribute:!0,type:String,converter:ne,reflect:!1,hasChanged:_e},rr=(i=tr,e,t)=>{const{kind:s,metadata:r}=t;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),n.set(t.name,i),s==="accessor"){const{name:c}=t;return{set(p){const g=e.get.call(this);e.set.call(this,p),this.requestUpdate(c,g,i)},init(p){return p!==void 0&&this.C(c,void 0,i,p),p}}}if(s==="setter"){const{name:c}=t;return function(p){const g=this[c];e.call(this,p),this.requestUpdate(c,g,i)}}throw Error("Unsupported decorator location: "+s)};function we(i){return(e,t)=>typeof t=="object"?rr(i,e,t):((s,r,n)=>{const c=r.hasOwnProperty(n);return r.constructor.createProperty(n,s),c?Object.getOwnPropertyDescriptor(r,n):void 0})(i,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function sr(i){return we({...i,state:!0,attribute:!1})}var Ye=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Vr(i){return i&&i.__esModule&&Object.prototype.hasOwnProperty.call(i,"default")?i.default:i}var Je={};/*! *****************************************************************************
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
***************************************************************************** */var Ke;function ir(){if(Ke)return Je;Ke=1;var i;return function(e){(function(t){var s=typeof globalThis=="object"?globalThis:typeof Ye=="object"?Ye:typeof self=="object"?self:typeof this=="object"?this:g(),r=n(e);typeof s.Reflect<"u"&&(r=n(s.Reflect,r)),t(r,s),typeof s.Reflect>"u"&&(s.Reflect=e);function n(_,w){return function(v,S){Object.defineProperty(_,v,{configurable:!0,writable:!0,value:S}),w&&w(v,S)}}function c(){try{return Function("return this;")()}catch{}}function p(){try{return(0,eval)("(function() { return this; })()")}catch{}}function g(){return c()||p()}})(function(t,s){var r=Object.prototype.hasOwnProperty,n=typeof Symbol=="function",c=n&&typeof Symbol.toPrimitive<"u"?Symbol.toPrimitive:"@@toPrimitive",p=n&&typeof Symbol.iterator<"u"?Symbol.iterator:"@@iterator",g=typeof Object.create=="function",_={__proto__:[]}instanceof Array,w=!g&&!_,v={create:g?function(){return ge(Object.create(null))}:_?function(){return ge({__proto__:null})}:function(){return ge({})},has:w?function(a,o){return r.call(a,o)}:function(a,o){return o in a},get:w?function(a,o){return r.call(a,o)?a[o]:void 0}:function(a,o){return a[o]}},S=Object.getPrototypeOf(Function),M=typeof Map=="function"&&typeof Map.prototype.entries=="function"?Map:Ft(),U=typeof Set=="function"&&typeof Set.prototype.entries=="function"?Set:Nt(),de=typeof WeakMap=="function"?WeakMap:Lt(),z=n?Symbol.for("@reflect-metadata:registry"):void 0,se=Rt(),Me=Dt(se);function vt(a,o,l,h){if(b(l)){if(!De(a))throw new TypeError;if(!He(o))throw new TypeError;return Mt(a,o)}else{if(!De(a))throw new TypeError;if(!T(o))throw new TypeError;if(!T(h)&&!b(h)&&!B(h))throw new TypeError;return B(h)&&(h=void 0),l=j(l),Tt(a,o,l,h)}}t("decorate",vt);function bt(a,o){function l(h,y){if(!T(h))throw new TypeError;if(!b(y)&&!It(y))throw new TypeError;Ce(a,o,h,y)}return l}t("metadata",bt);function _t(a,o,l,h){if(!T(l))throw new TypeError;return b(h)||(h=j(h)),Ce(a,o,l,h)}t("defineMetadata",_t);function wt(a,o,l){if(!T(o))throw new TypeError;return b(l)||(l=j(l)),Te(a,o,l)}t("hasMetadata",wt);function $t(a,o,l){if(!T(o))throw new TypeError;return b(l)||(l=j(l)),fe(a,o,l)}t("hasOwnMetadata",$t);function Pt(a,o,l){if(!T(o))throw new TypeError;return b(l)||(l=j(l)),ke(a,o,l)}t("getMetadata",Pt);function St(a,o,l){if(!T(o))throw new TypeError;return b(l)||(l=j(l)),xe(a,o,l)}t("getOwnMetadata",St);function At(a,o){if(!T(a))throw new TypeError;return b(o)||(o=j(o)),Ue(a,o)}t("getMetadataKeys",At);function Et(a,o){if(!T(a))throw new TypeError;return b(o)||(o=j(o)),Ie(a,o)}t("getOwnMetadataKeys",Et);function Ot(a,o,l){if(!T(o))throw new TypeError;if(b(l)||(l=j(l)),!T(o))throw new TypeError;b(l)||(l=j(l));var h=Y(o,l,!1);return b(h)?!1:h.OrdinaryDeleteMetadata(a,o,l)}t("deleteMetadata",Ot);function Mt(a,o){for(var l=a.length-1;l>=0;--l){var h=a[l],y=h(o);if(!b(y)&&!B(y)){if(!He(y))throw new TypeError;o=y}}return o}function Tt(a,o,l,h){for(var y=a.length-1;y>=0;--y){var E=a[y],k=E(o,l,h);if(!b(k)&&!B(k)){if(!T(k))throw new TypeError;h=k}}return h}function Te(a,o,l){var h=fe(a,o,l);if(h)return!0;var y=me(o);return B(y)?!1:Te(a,y,l)}function fe(a,o,l){var h=Y(o,l,!1);return b(h)?!1:Re(h.OrdinaryHasOwnMetadata(a,o,l))}function ke(a,o,l){var h=fe(a,o,l);if(h)return xe(a,o,l);var y=me(o);if(!B(y))return ke(a,y,l)}function xe(a,o,l){var h=Y(o,l,!1);if(!b(h))return h.OrdinaryGetOwnMetadata(a,o,l)}function Ce(a,o,l,h){var y=Y(l,h,!0);y.OrdinaryDefineOwnMetadata(a,o,l,h)}function Ue(a,o){var l=Ie(a,o),h=me(a);if(h===null)return l;var y=Ue(h,o);if(y.length<=0)return l;if(l.length<=0)return y;for(var E=new U,k=[],$=0,u=l;$<u.length;$++){var d=u[$],f=E.has(d);f||(E.add(d),k.push(d))}for(var m=0,P=y;m<P.length;m++){var d=P[m],f=E.has(d);f||(E.add(d),k.push(d))}return k}function Ie(a,o){var l=Y(a,o,!1);return l?l.OrdinaryOwnMetadataKeys(a,o):[]}function je(a){if(a===null)return 1;switch(typeof a){case"undefined":return 0;case"boolean":return 2;case"string":return 3;case"symbol":return 4;case"number":return 5;case"object":return a===null?1:6;default:return 6}}function b(a){return a===void 0}function B(a){return a===null}function kt(a){return typeof a=="symbol"}function T(a){return typeof a=="object"?a!==null:typeof a=="function"}function xt(a,o){switch(je(a)){case 0:return a;case 1:return a;case 2:return a;case 3:return a;case 4:return a;case 5:return a}var l="string",h=Fe(a,c);if(h!==void 0){var y=h.call(a,l);if(T(y))throw new TypeError;return y}return Ct(a)}function Ct(a,o){var l,h,y;{var E=a.toString;if(ie(E)){var h=E.call(a);if(!T(h))return h}var l=a.valueOf;if(ie(l)){var h=l.call(a);if(!T(h))return h}}throw new TypeError}function Re(a){return!!a}function Ut(a){return""+a}function j(a){var o=xt(a);return kt(o)?o:Ut(o)}function De(a){return Array.isArray?Array.isArray(a):a instanceof Object?a instanceof Array:Object.prototype.toString.call(a)==="[object Array]"}function ie(a){return typeof a=="function"}function He(a){return typeof a=="function"}function It(a){switch(je(a)){case 3:return!0;case 4:return!0;default:return!1}}function pe(a,o){return a===o||a!==a&&o!==o}function Fe(a,o){var l=a[o];if(l!=null){if(!ie(l))throw new TypeError;return l}}function Ne(a){var o=Fe(a,p);if(!ie(o))throw new TypeError;var l=o.call(a);if(!T(l))throw new TypeError;return l}function Le(a){return a.value}function qe(a){var o=a.next();return o.done?!1:o}function ze(a){var o=a.return;o&&o.call(a)}function me(a){var o=Object.getPrototypeOf(a);if(typeof a!="function"||a===S||o!==S)return o;var l=a.prototype,h=l&&Object.getPrototypeOf(l);if(h==null||h===Object.prototype)return o;var y=h.constructor;return typeof y!="function"||y===a?o:y}function jt(){var a;!b(z)&&typeof s.Reflect<"u"&&!(z in s.Reflect)&&typeof s.Reflect.defineMetadata=="function"&&(a=Ht(s.Reflect));var o,l,h,y=new de,E={registerProvider:k,getProvider:u,setProvider:f};return E;function k(m){if(!Object.isExtensible(E))throw new Error("Cannot add provider to a frozen registry.");switch(!0){case a===m:break;case b(o):o=m;break;case o===m:break;case b(l):l=m;break;case l===m:break;default:h===void 0&&(h=new U),h.add(m);break}}function $(m,P){if(!b(o)){if(o.isProviderFor(m,P))return o;if(!b(l)){if(l.isProviderFor(m,P))return o;if(!b(h))for(var A=Ne(h);;){var O=qe(A);if(!O)return;var I=Le(O);if(I.isProviderFor(m,P))return ze(A),I}}}if(!b(a)&&a.isProviderFor(m,P))return a}function u(m,P){var A=y.get(m),O;return b(A)||(O=A.get(P)),b(O)&&(O=$(m,P),b(O)||(b(A)&&(A=new M,y.set(m,A)),A.set(P,O))),O}function d(m){if(b(m))throw new TypeError;return o===m||l===m||!b(h)&&h.has(m)}function f(m,P,A){if(!d(A))throw new Error("Metadata provider not registered.");var O=u(m,P);if(O!==A){if(!b(O))return!1;var I=y.get(m);b(I)&&(I=new M,y.set(m,I)),I.set(P,A)}return!0}}function Rt(){var a;return!b(z)&&T(s.Reflect)&&Object.isExtensible(s.Reflect)&&(a=s.Reflect[z]),b(a)&&(a=jt()),!b(z)&&T(s.Reflect)&&Object.isExtensible(s.Reflect)&&Object.defineProperty(s.Reflect,z,{enumerable:!1,configurable:!1,writable:!1,value:a}),a}function Dt(a){var o=new de,l={isProviderFor:function(d,f){var m=o.get(d);return b(m)?!1:m.has(f)},OrdinaryDefineOwnMetadata:k,OrdinaryHasOwnMetadata:y,OrdinaryGetOwnMetadata:E,OrdinaryOwnMetadataKeys:$,OrdinaryDeleteMetadata:u};return se.registerProvider(l),l;function h(d,f,m){var P=o.get(d),A=!1;if(b(P)){if(!m)return;P=new M,o.set(d,P),A=!0}var O=P.get(f);if(b(O)){if(!m)return;if(O=new M,P.set(f,O),!a.setProvider(d,f,l))throw P.delete(f),A&&o.delete(d),new Error("Wrong provider for target.")}return O}function y(d,f,m){var P=h(f,m,!1);return b(P)?!1:Re(P.has(d))}function E(d,f,m){var P=h(f,m,!1);if(!b(P))return P.get(d)}function k(d,f,m,P){var A=h(m,P,!0);A.set(d,f)}function $(d,f){var m=[],P=h(d,f,!1);if(b(P))return m;for(var A=P.keys(),O=Ne(A),I=0;;){var Be=qe(O);if(!Be)return m.length=I,m;var qt=Le(Be);try{m[I]=qt}catch(zt){try{ze(O)}finally{throw zt}}I++}}function u(d,f,m){var P=h(f,m,!1);if(b(P)||!P.delete(d))return!1;if(P.size===0){var A=o.get(f);b(A)||(A.delete(m),A.size===0&&o.delete(A))}return!0}}function Ht(a){var o=a.defineMetadata,l=a.hasOwnMetadata,h=a.getOwnMetadata,y=a.getOwnMetadataKeys,E=a.deleteMetadata,k=new de,$={isProviderFor:function(u,d){var f=k.get(u);return!b(f)&&f.has(d)?!0:y(u,d).length?(b(f)&&(f=new U,k.set(u,f)),f.add(d),!0):!1},OrdinaryDefineOwnMetadata:o,OrdinaryHasOwnMetadata:l,OrdinaryGetOwnMetadata:h,OrdinaryOwnMetadataKeys:y,OrdinaryDeleteMetadata:E};return $}function Y(a,o,l){var h=se.getProvider(a,o);if(!b(h))return h;if(l){if(se.setProvider(a,o,Me))return Me;throw new Error("Illegal state.")}}function Ft(){var a={},o=[],l=function(){function $(u,d,f){this._index=0,this._keys=u,this._values=d,this._selector=f}return $.prototype["@@iterator"]=function(){return this},$.prototype[p]=function(){return this},$.prototype.next=function(){var u=this._index;if(u>=0&&u<this._keys.length){var d=this._selector(this._keys[u],this._values[u]);return u+1>=this._keys.length?(this._index=-1,this._keys=o,this._values=o):this._index++,{value:d,done:!1}}return{value:void 0,done:!0}},$.prototype.throw=function(u){throw this._index>=0&&(this._index=-1,this._keys=o,this._values=o),u},$.prototype.return=function(u){return this._index>=0&&(this._index=-1,this._keys=o,this._values=o),{value:u,done:!0}},$}(),h=function(){function $(){this._keys=[],this._values=[],this._cacheKey=a,this._cacheIndex=-2}return Object.defineProperty($.prototype,"size",{get:function(){return this._keys.length},enumerable:!0,configurable:!0}),$.prototype.has=function(u){return this._find(u,!1)>=0},$.prototype.get=function(u){var d=this._find(u,!1);return d>=0?this._values[d]:void 0},$.prototype.set=function(u,d){var f=this._find(u,!0);return this._values[f]=d,this},$.prototype.delete=function(u){var d=this._find(u,!1);if(d>=0){for(var f=this._keys.length,m=d+1;m<f;m++)this._keys[m-1]=this._keys[m],this._values[m-1]=this._values[m];return this._keys.length--,this._values.length--,pe(u,this._cacheKey)&&(this._cacheKey=a,this._cacheIndex=-2),!0}return!1},$.prototype.clear=function(){this._keys.length=0,this._values.length=0,this._cacheKey=a,this._cacheIndex=-2},$.prototype.keys=function(){return new l(this._keys,this._values,y)},$.prototype.values=function(){return new l(this._keys,this._values,E)},$.prototype.entries=function(){return new l(this._keys,this._values,k)},$.prototype["@@iterator"]=function(){return this.entries()},$.prototype[p]=function(){return this.entries()},$.prototype._find=function(u,d){if(!pe(this._cacheKey,u)){this._cacheIndex=-1;for(var f=0;f<this._keys.length;f++)if(pe(this._keys[f],u)){this._cacheIndex=f;break}}return this._cacheIndex<0&&d&&(this._cacheIndex=this._keys.length,this._keys.push(u),this._values.push(void 0)),this._cacheIndex},$}();return h;function y($,u){return $}function E($,u){return u}function k($,u){return[$,u]}}function Nt(){var a=function(){function o(){this._map=new M}return Object.defineProperty(o.prototype,"size",{get:function(){return this._map.size},enumerable:!0,configurable:!0}),o.prototype.has=function(l){return this._map.has(l)},o.prototype.add=function(l){return this._map.set(l,l),this},o.prototype.delete=function(l){return this._map.delete(l)},o.prototype.clear=function(){this._map.clear()},o.prototype.keys=function(){return this._map.keys()},o.prototype.values=function(){return this._map.keys()},o.prototype.entries=function(){return this._map.entries()},o.prototype["@@iterator"]=function(){return this.keys()},o.prototype[p]=function(){return this.keys()},o}();return a}function Lt(){var a=16,o=v.create(),l=h();return function(){function u(){this._key=h()}return u.prototype.has=function(d){var f=y(d,!1);return f!==void 0?v.has(f,this._key):!1},u.prototype.get=function(d){var f=y(d,!1);return f!==void 0?v.get(f,this._key):void 0},u.prototype.set=function(d,f){var m=y(d,!0);return m[this._key]=f,this},u.prototype.delete=function(d){var f=y(d,!1);return f!==void 0?delete f[this._key]:!1},u.prototype.clear=function(){this._key=h()},u}();function h(){var u;do u="@@WeakMap@@"+$();while(v.has(o,u));return o[u]=!0,u}function y(u,d){if(!r.call(u,l)){if(!d)return;Object.defineProperty(u,l,{value:v.create()})}return u[l]}function E(u,d){for(var f=0;f<d;++f)u[f]=Math.random()*255|0;return u}function k(u){if(typeof Uint8Array=="function"){var d=new Uint8Array(u);return typeof crypto<"u"?crypto.getRandomValues(d):typeof msCrypto<"u"?msCrypto.getRandomValues(d):E(d,u),d}return E(new Array(u),u)}function $(){var u=k(a);u[6]=u[6]&79|64,u[8]=u[8]&191|128;for(var d="",f=0;f<a;++f){var m=u[f];(f===4||f===6||f===8)&&(d+="-"),m<16&&(d+="0"),d+=m.toString(16).toLowerCase()}return d}}function ge(a){return a.__=void 0,delete a.__,a}})}(i||(i={})),Je}ir();const Q={Singleton:0,Transient:2};class F{constructor(){this.services=new Map,this.singletonInstances=new Map,this.tokenRegistry=new Map}static getInstance(){return F.instance||(F.instance=new F),F.instance}addService(e,t,s){this.services.set(e,{token:e,implementation:t,lifetime:s}),s===Q.Singleton&&(this.singletonInstances.has(e)||this.singletonInstances.set(e,new t))}getOrCreateToken(e){const t=e.name;return this.tokenRegistry.has(t)||this.tokenRegistry.set(t,Symbol(t)),this.tokenRegistry.get(t)}getService(e){const t=this.services.get(e);if(!t)throw new Error(`Service not registered for token: ${e.toString()}`);switch(t.lifetime){case Q.Singleton:return this.getSingletonInstance(t);case Q.Transient:return new t.implementation;default:throw new Error(`Unsupported lifetime: ${t.lifetime}`)}}getSingletonInstance(e){return this.singletonInstances.has(e.token)||this.singletonInstances.set(e.token,new e.implementation),this.singletonInstances.get(e.token)}}function ar(i=Q.Singleton){return function(e){const t=F.getInstance(),s=t.getOrCreateToken(e);return t.addService(s,e,i),e}}function nr(i){return function(e,t){const s=i||Reflect.getMetadata("design:type",e,t);if(!s)throw new Error(`Cannot resolve type for property '${t}'. Make sure emitDecoratorMetadata is enabled.`);const r=F.getInstance(),n=r.getOrCreateToken(s);Object.defineProperty(e,t,{get:function(){return r.getService(n)},enumerable:!0,configurable:!0})}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $e=globalThis,oe=$e.trustedTypes,Qe=oe?oe.createPolicy("lit-html",{createHTML:i=>i}):void 0,ut="$lit$",D=`lit$${Math.random().toFixed(9).slice(2)}$`,dt="?"+D,or=`<${dt}>`,L=document,X=()=>L.createComment(""),ee=i=>i===null||typeof i!="object"&&typeof i!="function",Pe=Array.isArray,lr=i=>Pe(i)||typeof i?.[Symbol.iterator]=="function",ye=`[ 	
\f\r]`,J=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Xe=/-->/g,et=/>/g,H=RegExp(`>|${ye}(?:([^\\s"'>=/]+)(${ye}*=${ye}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),tt=/'/g,rt=/"/g,ft=/^(?:script|style|textarea|title)$/i,cr=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),x=cr(1),W=Symbol.for("lit-noChange"),C=Symbol.for("lit-nothing"),st=new WeakMap,N=L.createTreeWalker(L,129);function pt(i,e){if(!Pe(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Qe!==void 0?Qe.createHTML(e):e}const hr=(i,e)=>{const t=i.length-1,s=[];let r,n=e===2?"<svg>":e===3?"<math>":"",c=J;for(let p=0;p<t;p++){const g=i[p];let _,w,v=-1,S=0;for(;S<g.length&&(c.lastIndex=S,w=c.exec(g),w!==null);)S=c.lastIndex,c===J?w[1]==="!--"?c=Xe:w[1]!==void 0?c=et:w[2]!==void 0?(ft.test(w[2])&&(r=RegExp("</"+w[2],"g")),c=H):w[3]!==void 0&&(c=H):c===H?w[0]===">"?(c=r??J,v=-1):w[1]===void 0?v=-2:(v=c.lastIndex-w[2].length,_=w[1],c=w[3]===void 0?H:w[3]==='"'?rt:tt):c===rt||c===tt?c=H:c===Xe||c===et?c=J:(c=H,r=void 0);const M=c===H&&i[p+1].startsWith("/>")?" ":"";n+=c===J?g+or:v>=0?(s.push(_),g.slice(0,v)+ut+g.slice(v)+D+M):g+D+(v===-2?p:M)}return[pt(i,n+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class te{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let n=0,c=0;const p=e.length-1,g=this.parts,[_,w]=hr(e,t);if(this.el=te.createElement(_,s),N.currentNode=this.el.content,t===2||t===3){const v=this.el.content.firstChild;v.replaceWith(...v.childNodes)}for(;(r=N.nextNode())!==null&&g.length<p;){if(r.nodeType===1){if(r.hasAttributes())for(const v of r.getAttributeNames())if(v.endsWith(ut)){const S=w[c++],M=r.getAttribute(v).split(D),U=/([.?@])?(.*)/.exec(S);g.push({type:1,index:n,name:U[2],strings:M,ctor:U[1]==="."?dr:U[1]==="?"?fr:U[1]==="@"?pr:ue}),r.removeAttribute(v)}else v.startsWith(D)&&(g.push({type:6,index:n}),r.removeAttribute(v));if(ft.test(r.tagName)){const v=r.textContent.split(D),S=v.length-1;if(S>0){r.textContent=oe?oe.emptyScript:"";for(let M=0;M<S;M++)r.append(v[M],X()),N.nextNode(),g.push({type:2,index:++n});r.append(v[S],X())}}}else if(r.nodeType===8)if(r.data===dt)g.push({type:2,index:n});else{let v=-1;for(;(v=r.data.indexOf(D,v+1))!==-1;)g.push({type:7,index:n}),v+=D.length-1}n++}}static createElement(e,t){const s=L.createElement("template");return s.innerHTML=e,s}}function Z(i,e,t=i,s){if(e===W)return e;let r=s!==void 0?t._$Co?.[s]:t._$Cl;const n=ee(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(i),r._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=r:t._$Cl=r),r!==void 0&&(e=Z(i,r._$AS(i,e.values),r,s)),e}class ur{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,r=(e?.creationScope??L).importNode(t,!0);N.currentNode=r;let n=N.nextNode(),c=0,p=0,g=s[0];for(;g!==void 0;){if(c===g.index){let _;g.type===2?_=new re(n,n.nextSibling,this,e):g.type===1?_=new g.ctor(n,g.name,g.strings,this,e):g.type===6&&(_=new mr(n,this,e)),this._$AV.push(_),g=s[++p]}c!==g?.index&&(n=N.nextNode(),c++)}return N.currentNode=L,r}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class re{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,r){this.type=2,this._$AH=C,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Z(this,e,t),ee(e)?e===C||e==null||e===""?(this._$AH!==C&&this._$AR(),this._$AH=C):e!==this._$AH&&e!==W&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):lr(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==C&&ee(this._$AH)?this._$AA.nextSibling.data=e:this.T(L.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,r=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=te.createElement(pt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(t);else{const n=new ur(r,this),c=n.u(this.options);n.p(t),this.T(c),this._$AH=n}}_$AC(e){let t=st.get(e.strings);return t===void 0&&st.set(e.strings,t=new te(e)),t}k(e){Pe(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,r=0;for(const n of e)r===t.length?t.push(s=new re(this.O(X()),this.O(X()),this,this.options)):s=t[r],s._$AI(n),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=e.nextSibling;e.remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class ue{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,r,n){this.type=1,this._$AH=C,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=C}_$AI(e,t=this,s,r){const n=this.strings;let c=!1;if(n===void 0)e=Z(this,e,t,0),c=!ee(e)||e!==this._$AH&&e!==W,c&&(this._$AH=e);else{const p=e;let g,_;for(e=n[0],g=0;g<n.length-1;g++)_=Z(this,p[s+g],t,g),_===W&&(_=this._$AH[g]),c||=!ee(_)||_!==this._$AH[g],_===C?e=C:e!==C&&(e+=(_??"")+n[g+1]),this._$AH[g]=_}c&&!r&&this.j(e)}j(e){e===C?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class dr extends ue{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===C?void 0:e}}class fr extends ue{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==C)}}class pr extends ue{constructor(e,t,s,r,n){super(e,t,s,r,n),this.type=5}_$AI(e,t=this){if((e=Z(this,e,t,0)??C)===W)return;const s=this._$AH,r=e===C&&s!==C||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==C&&(s===C||r);r&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class mr{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){Z(this,e)}}const gr=$e.litHtmlPolyfillSupport;gr?.(te,re),($e.litHtmlVersions??=[]).push("3.3.1");const yr=(i,e,t)=>{const s=t?.renderBefore??e;let r=s._$litPart$;if(r===void 0){const n=t?.renderBefore??null;s._$litPart$=r=new re(e.insertBefore(X(),n),n,void 0,t??{})}return r._$AI(i),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Se=globalThis;class V extends G{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=yr(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}V._$litElement$=!0,V.finalized=!0,Se.litElementHydrateSupport?.({LitElement:V});const vr=Se.litElementPolyfillSupport;vr?.({LitElement:V});(Se.litElementVersions??=[]).push("4.2.1");var br=Object.defineProperty,_r=Object.getOwnPropertyDescriptor,Ae=(i,e,t,s)=>{for(var r=s>1?void 0:s?_r(e,t):e,n=i.length-1,c;n>=0;n--)(c=i[n])&&(r=(s?c(e,t,r):c(r))||r);return s&&r&&br(e,t,r),r};let le=class extends V{constructor(){super(...arguments),this.currentPath="",this.handleNavigation=()=>{const i=window.location.hash;let e=i?i.substring(1):"";e.startsWith("/")||(e="/"+e),this.currentPath=e,this.requestUpdate()}}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleNavigation),this.handleNavigation()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleNavigation)}createRenderRoot(){return this}render(){for(const[i,e]of mt.entries()){const t=new RegExp("^"+i.replace(/:[^\s/]+/g,"([\\w-]+)")+"$"),s=this.currentPath.match(t);if(s){const r=s.slice(1),n=new e;return n.routeParams=r,this.renderContentWithLayout(()=>x`<div>${n}</div>`)}}return this.renderContentWithLayout(()=>x`<h1>404 Not Found</h1>`)}renderContentWithLayout(i){if(!this.defaultLayout)return i();const e=new this.defaultLayout;return e.body=i(),x`
            <div>${e}</div>
        `}};Ae([we({attribute:!1})],le.prototype,"defaultLayout",2);Ae([sr()],le.prototype,"currentPath",2);le=Ae([q("router-outlet")],le);const mt=new Map;function Ee(i){return function(e){return mt.set(i,e),e}}const Oe=class Oe extends V{createRenderRoot(){return this.constructor.useShadowDom?super.createRenderRoot():this}};Oe.useShadowDom=!1;let R=Oe;class wr extends R{}var $r=Object.getOwnPropertyDescriptor,Pr=(i,e,t,s)=>{for(var r=s>1?void 0:s?$r(e,t):e,n=i.length-1,c;n>=0;n--)(c=i[n])&&(r=c(r)||r);return r};let it=class extends R{render(){return x`
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
    `}};it=Pr([q("home-page"),Ee("/")],it);const Sr="modulepreload",Ar=function(i){return"/PlayableTools/"+i},at={},Er=function(e,t,s){let r=Promise.resolve();if(t&&t.length>0){let g=function(_){return Promise.all(_.map(w=>Promise.resolve(w).then(v=>({status:"fulfilled",value:v}),v=>({status:"rejected",reason:v}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),p=c?.nonce||c?.getAttribute("nonce");r=g(t.map(_=>{if(_=Ar(_),_ in at)return;at[_]=!0;const w=_.endsWith(".css"),v=w?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${_}"]${v}`))return;const S=document.createElement("link");if(S.rel=w?"stylesheet":Sr,w||(S.as="script"),S.crossOrigin="",S.href=_,p&&S.setAttribute("nonce",p),document.head.appendChild(S),w)return new Promise((M,U)=>{S.addEventListener("load",M),S.addEventListener("error",()=>U(new Error(`Unable to preload CSS for ${_}`)))})}))}function n(c){const p=new Event("vite:preloadError",{cancelable:!0});if(p.payload=c,window.dispatchEvent(p),!p.defaultPrevented)throw c}return r.then(c=>{for(const p of c||[])p.status==="rejected"&&n(p.reason);return e().catch(n)})},Or=[{Name:"Facebook",InjeectScripts:["cta.Facebook.js"]},{Name:"Moloco",InjeectScripts:["cta.Moloco.js"]},{Name:"Facebook_Zip",format:"zip",ExtractScripts:!0,InjeectScripts:["cta.Facebook_Zip.js"]},{Name:"Mintegral",format:"zip",OutputIndexHtmlName:"%name%.html",InjeectScripts:["cta.Mintegral.js"]},{Name:"IronSource",InjeectScripts:["cta.IronSource.js"]},{Name:"AdColony",InjeectScripts:["cta.AdColony.js"]},{Name:"Unity",InjeectScripts:["cta.Unity.js"]},{Name:"Applovin",InjeectScripts:["cta.Applovin.js"]},{Name:"Vungle",OutputIndexHtmlName:"ad.html",format:"zip",ExtraFiles:[{from:"./Vungle/index.html",to:"./index.html"}],InjeectScripts:["cta.Vungle.js"]},{Name:"TikTok",format:"zip",OutputIndexHtmlName:"index.html",ExtraFiles:[{from:"./TikTok/config.json",to:"./config.json"}],InjeectScripts:["cta.TikTok.js"]},{Name:"Google",OutputIndexHtmlName:"index.html",format:"zip",Sizes:{"320x480":"width=320,height=480","480x320":"width=480,height=320","300x250":"width=300,height=250"},InjeectScripts:["cta.Google.js"]}],Mr={platforms:Or};var Tr=Object.getOwnPropertyDescriptor,kr=(i,e,t,s)=>{for(var r=s>1?void 0:s?Tr(e,t):e,n=i.length-1,c;n>=0;n--)(c=i[n])&&(r=c(r)||r);return r};let ve=class{constructor(){this.config=[],this.loadConfig(Mr)}loadConfig(i){if(Array.isArray(i.platforms))this.config=i.platforms,console.log("PlayablePublishService: Loaded platforms config:",this.config);else throw new Error("Invalid config: platforms array missing")}getPlatforms(){return this.config}getAvailablePlatforms(){return this.config.map(i=>i.Name)}async processHtml(i,e,t){const s=this.config.find(n=>n.Name===e);if(!s)throw new Error(`Platform '${e}' not found in config`);let r=i;return s.InjeectScripts&&Array.isArray(s.InjeectScripts)&&(r=await this.injectScripts(r,s.InjeectScripts)),s.OutputIndexHtmlName&&t?.name,r}async injectScripts(i,e){let t=i;for(const s of e)try{const r=await fetch(`/publish-data/${s}`);if(r.ok){const c=`<script>
${await r.text()}
<\/script>`;if(/<head[^>]*>/i.test(t)){const p=t.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);if(p){const g=p[2],_=g.match(/<script[^>]*>/i);if(_){const w=p.index+p[1].length+g.indexOf(_[0]);t=t.slice(0,w)+`
${c}
`+t.slice(w)}else t=t.replace(/<\/head>/i,`${c}
</head>`)}}else/<\/body>/i.test(t)?t=t.replace(/<\/body>/i,`${c}
</body>`):t=t+c}else console.warn(`Could not load script: ${s}`)}catch(r){console.warn(`Failed to inject script ${s}:`,r)}return t}async processAllPlatforms(i,e){if(!e.outputDirectory)throw new Error("Output directory is required");const t=e.name||"Playable",s=e.suffix||"EN";let r=this.config;e.selectedPlatforms&&Array.isArray(e.selectedPlatforms)&&e.selectedPlatforms.length>0&&(r=this.config.filter(p=>e.selectedPlatforms.includes(p.Name)));const n=r.length;let c=0;for(const p of r){const g=await this.createPlatformDirectory(e.outputDirectory,p.Name),_=await this.processHtml(i,p.Name,e),w=this.generateFileName(t,p.Name,s,p);p.format==="zip"?await this.createZipPackageToDirectory(_,w,g,p):await this.saveHtmlFileToDirectory(_,w,g),c++;const v=30+c/n*70;e.onProgress?.(v,p.Name)}}generateFileName(i,e,t,s){return s.OutputIndexHtmlName?s.OutputIndexHtmlName.includes("%name%")?s.OutputIndexHtmlName.replace("%name%",i):s.OutputIndexHtmlName:`${i}_${e}_${t}.html`}async createPlatformDirectory(i,e){try{const t=await i.getDirectoryHandle(e,{create:!0});return console.log(`Created/accessed directory: ${e}`),t}catch(t){throw new Error(`Failed to create platform directory ${e}: ${t}`)}}async saveHtmlFileToDirectory(i,e,t){try{const r=await(await t.getFileHandle(e,{create:!0})).createWritable();await r.write(i),await r.close();const n=(i.length/1024).toFixed(2);console.log(`Saved HTML file: ${e} (${n} KB)`)}catch(s){throw new Error(`Failed to save HTML file ${e}: ${s}`)}}async createZipPackageToDirectory(i,e,t,s){try{const r=(await Er(async()=>{const{default:v}=await import("./jszip.min-CBLOyKX4.js").then(S=>S.j);return{default:v}},[])).default,n=new r;if(n.file(e,i),s.ExtraFiles)for(const v of s.ExtraFiles)try{const S=`/publish-data/${v.from.replace("./","")}`,M=await fetch(S);if(M.ok){const U=await M.text();n.file(v.to.replace("./",""),U)}else console.warn(`Could not load extra file from: ${S}`)}catch(S){console.warn(`Could not load extra file: ${v.from}`,S)}const c=await n.generateAsync({type:"blob"}),p=e.replace(".html",".zip"),_=await(await t.getFileHandle(p,{create:!0})).createWritable();await _.write(c),await _.close();const w=(c.size/1024).toFixed(2);console.log(`Saved ZIP file: ${p} (${w} KB)`)}catch(r){throw new Error(`Failed to create ZIP package ${e}: ${r}`)}}async requestOutputDirectory(){if("showDirectoryPicker"in window)try{const i=await window.showDirectoryPicker();return console.log(`Selected output directory: ${i.name}`),i}catch(i){throw i instanceof Error&&i.name==="AbortError"?new Error("Directory selection was cancelled"):new Error(`Failed to select directory: ${i}`)}else throw new Error("File System Access API is not supported in this browser. Please use Chrome, Edge, or another supported browser.")}};ve=kr([ar(Q.Singleton)],ve);var xr=Object.defineProperty,Cr=(i,e,t,s)=>{for(var r=void 0,n=i.length-1,c;n>=0;n--)(c=i[n])&&(r=c(e,t,r)||r);return r&&xr(e,t,r),r};class gt extends R{constructor(){super(...arguments),this.dragActive=!1,this.loadedFile=null,this.isPublishing=!1,this.publishProgress=0,this.currentPlatform=null,this.publishStartTime=null,this.publishElapsed=null,this.playableTitle="",this.googlePlayUrl="",this.appStoreUrl="",this.customSuffix="EN",this.outputDirectory="",this.availablePlatforms=[],this.selectedPlatforms=[],this.STORAGE_KEYS={playableTitle:"playable-publisher-title",googlePlayUrl:"playable-publisher-google-url",appStoreUrl:"playable-publisher-app-store-url",customSuffix:"playable-publisher-suffix",selectedPlatforms:"playable-publisher-selected-platforms"}}connectedCallback(){super.connectedCallback(),this.loadFromLocalStorage(),this.playablePublishService&&typeof this.playablePublishService.getAvailablePlatforms=="function"&&(this.availablePlatforms=this.playablePublishService.getAvailablePlatforms(),(!this.selectedPlatforms||this.selectedPlatforms.length===0)&&(this.selectedPlatforms=[...this.availablePlatforms]))}render(){return x`
      <div class="playable-publisher">
        <div style="margin-bottom:1.5rem">
          <strong>Publish Playable Ad</strong><br />
          <small>
            Use this tool to upload your playable ad HTML file and prepare it
            for different platforms.<br />
            Drop your .html file below or select it manually.
          </small>
        </div>

        ${this.loadedFile?x`
              <div style="margin-top:1rem;color:#0078d4">
                <strong>File loaded:</strong> ${this.loadedFile.name}
                (${(this.loadedFile.size/1024).toFixed(2)} KB)

                ${this.isPublishing?x`
                      <div class="progress-container">
                        <div class="progress-text">
                          Publishing... ${Math.round(this.publishProgress)}%
                          ${this.currentPlatform?x`<span style="margin-left:1em;">(${this.currentPlatform})</span>`:""}
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
            `:x`
              <div
                class="dropzone ${this.dragActive?"dragover":""}"
                @dragover=${this._onDragOver}
                @dragleave=${this._onDragLeave}
                @drop=${this._onDrop}
              >
                <p>Drop your .html file here or</p>
                <label style="background: #0078d4; color: white;">
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
        ${this.loadedFile?x`
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
            <div class="form-row compact-row" style="margin-top: 1rem;">
              <label style="vertical-align: top;">Platforms:</label>
              <div style="display: inline-block; margin-left: 8px;">
                <div style="margin-bottom: 0.5em;">
                  <a href="#" @click=${this._selectAllPlatforms} style="margin-right: 1em; font-size: 0.95em;">Select all</a>
                  <a href="#" @click=${this._clearAllPlatforms} style="font-size: 0.95em;">Clear all</a>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5em; border: 1px solid #ccc; padding: 0.5em; border-radius: 4px; background: #fafbfc;">
                  ${this.availablePlatforms.map(e=>x`
                    <label style="flex: 0 0 180px; display: flex; align-items: center; margin-bottom: 0.25em;">
                      <input
                        type="checkbox"
                        .checked=${this.selectedPlatforms.includes(e)}
                        @change=${t=>this._onPlatformCheckboxChange(t,e)}
                        style="margin-right: 0.5em;"
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
          ${this.loadedFile&&this.playableTitle&&!this.isPublishing?x`
            <button 
              @click=${this._publishPlayable}
              style="margin-right: 0.5rem;"
              ?disabled=${!this.selectedPlatforms.length}
            >
              Publish
            </button>
          `:null}
          ${this.loadedFile&&!this.isPublishing?x`
            <button 
              @click=${this._resetFile}
            >
              Cancel
            </button>
          `:null}
        </div>
      </div>
    `}_onPlatformCheckboxChange(e,t){e.target.checked?this.selectedPlatforms.includes(t)||(this.selectedPlatforms=[...this.selectedPlatforms,t]):this.selectedPlatforms=this.selectedPlatforms.filter(r=>r!==t),this.saveToLocalStorage(),this.requestUpdate()}_selectAllPlatforms(e){e.preventDefault(),this.selectedPlatforms=[...this.availablePlatforms],this.saveToLocalStorage(),this.requestUpdate()}_clearAllPlatforms(e){e.preventDefault(),this.selectedPlatforms=[],this.saveToLocalStorage(),this.requestUpdate()}_onDragOver(e){e.preventDefault(),this.dragActive=!0,this.requestUpdate()}_onDragLeave(e){e.preventDefault(),this.dragActive=!1,this.requestUpdate()}_onDrop(e){e.preventDefault(),this.dragActive=!1,this.requestUpdate();const t=e.dataTransfer?.files;t&&t.length&&this._processFile(t[0])}_onFileChange(e){const s=e.target.files?.[0];s&&this._processFile(s)}_processFile(e){if(e&&e.name.endsWith(".html")){this.loadedFile=e,this.requestUpdate();const t=new CustomEvent("file-selected",{detail:e});this.dispatchEvent(t)}else alert("Please select a valid .html file.")}_resetFile(){this.loadedFile=null,this.requestUpdate()}async _publishPlayable(){if(!this.loadedFile||!this.playableTitle){alert("Please provide a playable title and select a file.");return}if(!this.selectedPlatforms||this.selectedPlatforms.length===0){alert("Please select at least one platform to publish.");return}try{this.isPublishing=!0,this.publishProgress=0,this.currentPlatform=null,this.publishElapsed=null,this.requestUpdate(),this.publishProgress=10,this.requestUpdate();const e=await this.playablePublishService.requestOutputDirectory();this.publishStartTime=Date.now(),this.publishProgress=20,this.requestUpdate();const t=await this._readFileContent(this.loadedFile),s={name:this.playableTitle,title:this.playableTitle,googlePlayUrl:this.googlePlayUrl,appStoreUrl:this.appStoreUrl,suffix:this.customSuffix,outputDirectory:e,onProgress:(r,n)=>{this.publishProgress=r,n&&(this.currentPlatform=n),this.requestUpdate()},selectedPlatforms:[...this.selectedPlatforms]};if(this.publishProgress=30,this.requestUpdate(),await this.playablePublishService.processAllPlatforms(t,s),this.publishProgress=100,this.currentPlatform=null,this.publishStartTime){const r=Date.now()-this.publishStartTime;this.publishElapsed=this._formatElapsed(r)}this.requestUpdate(),setTimeout(()=>{let r="Publishing completed successfully! Files have been saved to the selected directory with subfolders for each platform.";this.publishElapsed&&(r+=`

Elapsed time: ${this.publishElapsed}`),alert(r),this.isPublishing=!1,this.publishProgress=0,this.publishElapsed=null,this.publishStartTime=null,this.requestUpdate()},500)}catch(e){console.error("Publishing failed:",e);let t=e instanceof Error?e.message:"Unknown error";t.includes("File System Access API is not supported")&&(t+=`

For best results, please use Chrome 86+, Edge 86+, or another browser that supports the File System Access API.`),alert(`Publishing failed: ${t}`),this.isPublishing=!1,this.publishProgress=0,this.requestUpdate()}}_formatElapsed(e){const t=Math.floor(e/1e3),s=Math.floor(t/60),r=t%60;return s>0?`${s}m ${r}s`:`${r}s`}_readFileContent(e){return new Promise((t,s)=>{const r=new FileReader;r.onload=n=>{const c=n.target?.result;typeof c=="string"?t(c):s(new Error("Failed to read file as text"))},r.onerror=()=>s(new Error("Failed to read file")),r.readAsText(e)})}loadFromLocalStorage(){this.playableTitle=localStorage.getItem(this.STORAGE_KEYS.playableTitle)||"",this.googlePlayUrl=localStorage.getItem(this.STORAGE_KEYS.googlePlayUrl)||"",this.appStoreUrl=localStorage.getItem(this.STORAGE_KEYS.appStoreUrl)||"",this.customSuffix=localStorage.getItem(this.STORAGE_KEYS.customSuffix)||"EN";const e=localStorage.getItem(this.STORAGE_KEYS.selectedPlatforms);if(e)try{const t=JSON.parse(e);Array.isArray(t)&&(this.selectedPlatforms=t)}catch{}this.requestUpdate()}saveToLocalStorage(){localStorage.setItem(this.STORAGE_KEYS.playableTitle,this.playableTitle),localStorage.setItem(this.STORAGE_KEYS.googlePlayUrl,this.googlePlayUrl),localStorage.setItem(this.STORAGE_KEYS.appStoreUrl,this.appStoreUrl),localStorage.setItem(this.STORAGE_KEYS.customSuffix,this.customSuffix),localStorage.setItem(this.STORAGE_KEYS.selectedPlatforms,JSON.stringify(this.selectedPlatforms))}updateField(e,t){switch(e){case"playableTitle":this.playableTitle=t;break;case"googlePlayUrl":this.googlePlayUrl=t;break;case"appStoreUrl":this.appStoreUrl=t;break;case"customSuffix":this.customSuffix=t;break}this.saveToLocalStorage(),this.requestUpdate()}}Cr([nr(ve)],gt.prototype,"playablePublishService");customElements.define("playable-publisher",gt);var Ur=Object.getOwnPropertyDescriptor,Ir=(i,e,t,s)=>{for(var r=s>1?void 0:s?Ur(e,t):e,n=i.length-1,c;n>=0;n--)(c=i[n])&&(r=c(r)||r);return r};let nt=class extends R{render(){return x` <playable-publisher></playable-publisher> `}};nt=Ir([q("publish-page"),Ee("/publish")],nt);var jr=Object.getOwnPropertyDescriptor,Rr=(i,e,t,s)=>{for(var r=s>1?void 0:s?jr(e,t):e,n=i.length-1,c;n>=0;n--)(c=i[n])&&(r=c(r)||r);return r};let ot=class extends R{render(){return x`
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
    `}};ot=Rr([q("validate-page"),Ee("/validate")],ot);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Dr=i=>i??C;var Hr=Object.getOwnPropertyDescriptor,Fr=(i,e,t,s)=>{for(var r=s>1?void 0:s?Hr(e,t):e,n=i.length-1,c;n>=0;n--)(c=i[n])&&(r=c(r)||r);return r};let lt=class extends R{constructor(){super(...arguments),this.menuItems=[{label:"Home",path:"/",disabled:!1},{label:"Publish",path:"/publish",disabled:!1},{label:"Validate",path:"/validate",disabled:!1},{label:"Compress assets",path:"/weather",disabled:!0},{label:"FAQ",path:"/faq",disabled:!0}],this.handleHashChange=()=>{this.requestUpdate()}}get currentPath(){let i=window.location.hash?window.location.hash.substring(1):"";return i.startsWith("/")||(i="/"+i),i}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleHashChange)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleHashChange)}render(){return x`
      <nav aria-label="Main menu">
        <ul>
          ${this.menuItems.map(i=>{const e=this.currentPath===i.path;return x`
              <li>
                <a
                  href=${Dr(i.disabled?void 0:`#${i.path.substring(1)}`)}
                  class="${e?"active":""} ${i.disabled?"disabled":""}"
                  tabindex="${i.disabled?-1:0}"
                  aria-disabled="${i.disabled}"
                  title=${i.disabled?"Coming soon":""}
                  ...=${e?{"aria-current":"page"}:{}}
                  @click=${i.disabled?t=>t.preventDefault():void 0}
                >
                  ${i.label}
                </a>
              </li>
            `})}
        </ul>
      </nav>
    `}};lt=Fr([q("nav-menu")],lt);var Nr=Object.defineProperty,Lr=Object.getOwnPropertyDescriptor,yt=(i,e,t,s)=>{for(var r=s>1?void 0:s?Lr(e,t):e,n=i.length-1,c;n>=0;n--)(c=i[n])&&(r=(s?c(e,t,r):c(r))||r);return s&&r&&Nr(e,t,r),r};let ce=class extends wr{render(){return x`
      <div class="layout">
        <header class="header">
          <a href="/" class="header-link">
            <span>
              <div class="subheader">Gritsenko</div>
              Playable Ad Tools
            </span>
          </a>
          <nav class="menu">
            <nav-menu></nav-menu>
          </nav>
        </header>
        <main class="main">${this.body}</main>
      </div>
    `}};yt([we({attribute:!1,type:Object})],ce.prototype,"body",2);ce=yt([q("main-layout")],ce);var qr=Object.getOwnPropertyDescriptor,zr=(i,e,t,s)=>{for(var r=s>1?void 0:s?qr(e,t):e,n=i.length-1,c;n>=0;n--)(c=i[n])&&(r=c(r)||r);return r};let ct=class extends R{render(){return x`
      <router-outlet .defaultLayout="${ce}"></router-outlet>
    `}};ct=zr([q("app-root")],ct);export{Ye as c,Vr as g};
