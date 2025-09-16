(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const we=e=>(i,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(e,i)}):customElements.define(e,i)};/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const qi=globalThis,an=qi.ShadowRoot&&(qi.ShadyCSS===void 0||qi.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,sn=Symbol(),On=new WeakMap;let ja=class{constructor(i,t,r){if(this._$cssResult$=!0,r!==sn)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=i,this.t=t}get styleSheet(){let i=this.o;const t=this.t;if(an&&i===void 0){const r=t!==void 0&&t.length===1;r&&(i=On.get(t)),i===void 0&&((this.o=i=new CSSStyleSheet).replaceSync(this.cssText),r&&On.set(t,i))}return i}toString(){return this.cssText}};const Js=e=>new ja(typeof e=="string"?e:e+"",void 0,sn),qa=(e,...i)=>{const t=e.length===1?e[0]:i.reduce((r,n,a)=>r+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[a+1],e[0]);return new ja(t,e,sn)},Qs=(e,i)=>{if(an)e.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of i){const r=document.createElement("style"),n=qi.litNonce;n!==void 0&&r.setAttribute("nonce",n),r.textContent=t.cssText,e.appendChild(r)}},Dn=an?e=>e:e=>e instanceof CSSStyleSheet?(i=>{let t="";for(const r of i.cssRules)t+=r.cssText;return Js(t)})(e):e;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:eo,defineProperty:to,getOwnPropertyDescriptor:io,getOwnPropertyNames:ro,getOwnPropertySymbols:no,getPrototypeOf:ao}=Object,ar=globalThis,In=ar.trustedTypes,so=In?In.emptyScript:"",oo=ar.reactiveElementPolyfillSupport,ri=(e,i)=>e,Wi={toAttribute(e,i){switch(i){case Boolean:e=e?so:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,i){let t=e;switch(i){case Boolean:t=e!==null;break;case Number:t=e===null?null:Number(e);break;case Object:case Array:try{t=JSON.parse(e)}catch{t=null}}return t}},on=(e,i)=>!eo(e,i),Mn={attribute:!0,type:String,converter:Wi,reflect:!1,useDefault:!1,hasChanged:on};Symbol.metadata??=Symbol("metadata"),ar.litPropertyMetadata??=new WeakMap;let Pt=class extends HTMLElement{static addInitializer(i){this._$Ei(),(this.l??=[]).push(i)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(i,t=Mn){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(i)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(i,t),!t.noAccessor){const r=Symbol(),n=this.getPropertyDescriptor(i,r,t);n!==void 0&&to(this.prototype,i,n)}}static getPropertyDescriptor(i,t,r){const{get:n,set:a}=io(this.prototype,i)??{get(){return this[t]},set(o){this[t]=o}};return{get:n,set(o){const l=n?.call(this);a?.call(this,o),this.requestUpdate(i,l,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(i){return this.elementProperties.get(i)??Mn}static _$Ei(){if(this.hasOwnProperty(ri("elementProperties")))return;const i=ao(this);i.finalize(),i.l!==void 0&&(this.l=[...i.l]),this.elementProperties=new Map(i.elementProperties)}static finalize(){if(this.hasOwnProperty(ri("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ri("properties"))){const t=this.properties,r=[...ro(t),...no(t)];for(const n of r)this.createProperty(n,t[n])}const i=this[Symbol.metadata];if(i!==null){const t=litPropertyMetadata.get(i);if(t!==void 0)for(const[r,n]of t)this.elementProperties.set(r,n)}this._$Eh=new Map;for(const[t,r]of this.elementProperties){const n=this._$Eu(t,r);n!==void 0&&this._$Eh.set(n,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(i){const t=[];if(Array.isArray(i)){const r=new Set(i.flat(1/0).reverse());for(const n of r)t.unshift(Dn(n))}else i!==void 0&&t.push(Dn(i));return t}static _$Eu(i,t){const r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof i=="string"?i.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(i=>this.enableUpdating=i),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(i=>i(this))}addController(i){(this._$EO??=new Set).add(i),this.renderRoot!==void 0&&this.isConnected&&i.hostConnected?.()}removeController(i){this._$EO?.delete(i)}_$E_(){const i=new Map,t=this.constructor.elementProperties;for(const r of t.keys())this.hasOwnProperty(r)&&(i.set(r,this[r]),delete this[r]);i.size>0&&(this._$Ep=i)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Qs(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(i=>i.hostConnected?.())}enableUpdating(i){}disconnectedCallback(){this._$EO?.forEach(i=>i.hostDisconnected?.())}attributeChangedCallback(i,t,r){this._$AK(i,r)}_$ET(i,t){const r=this.constructor.elementProperties.get(i),n=this.constructor._$Eu(i,r);if(n!==void 0&&r.reflect===!0){const a=(r.converter?.toAttribute!==void 0?r.converter:Wi).toAttribute(t,r.type);this._$Em=i,a==null?this.removeAttribute(n):this.setAttribute(n,a),this._$Em=null}}_$AK(i,t){const r=this.constructor,n=r._$Eh.get(i);if(n!==void 0&&this._$Em!==n){const a=r.getPropertyOptions(n),o=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:Wi;this._$Em=n;const l=o.fromAttribute(t,a.type);this[n]=l??this._$Ej?.get(n)??l,this._$Em=null}}requestUpdate(i,t,r){if(i!==void 0){const n=this.constructor,a=this[i];if(r??=n.getPropertyOptions(i),!((r.hasChanged??on)(a,t)||r.useDefault&&r.reflect&&a===this._$Ej?.get(i)&&!this.hasAttribute(n._$Eu(i,r))))return;this.C(i,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(i,t,{useDefault:r,reflect:n,wrapped:a},o){r&&!(this._$Ej??=new Map).has(i)&&(this._$Ej.set(i,o??t??this[i]),a!==!0||o!==void 0)||(this._$AL.has(i)||(this.hasUpdated||r||(t=void 0),this._$AL.set(i,t)),n===!0&&this._$Em!==i&&(this._$Eq??=new Set).add(i))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const i=this.scheduleUpdate();return i!=null&&await i,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[n,a]of this._$Ep)this[n]=a;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[n,a]of r){const{wrapped:o}=a,l=this[n];o!==!0||this._$AL.has(n)||l===void 0||this.C(n,void 0,a,l)}}let i=!1;const t=this._$AL;try{i=this.shouldUpdate(t),i?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw i=!1,this._$EM(),r}i&&this._$AE(t)}willUpdate(i){}_$AE(i){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(i)),this.updated(i)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(i){return!0}update(i){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(i){}firstUpdated(i){}};Pt.elementStyles=[],Pt.shadowRootOptions={mode:"open"},Pt[ri("elementProperties")]=new Map,Pt[ri("finalized")]=new Map,oo?.({ReactiveElement:Pt}),(ar.reactiveElementVersions??=[]).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const lo={attribute:!0,type:String,converter:Wi,reflect:!1,hasChanged:on},co=(e=lo,i,t)=>{const{kind:r,metadata:n}=t;let a=globalThis.litPropertyMetadata.get(n);if(a===void 0&&globalThis.litPropertyMetadata.set(n,a=new Map),r==="setter"&&((e=Object.create(e)).wrapped=!0),a.set(t.name,e),r==="accessor"){const{name:o}=t;return{set(l){const u=i.get.call(this);i.set.call(this,l),this.requestUpdate(o,u,e)},init(l){return l!==void 0&&this.C(o,void 0,e,l),l}}}if(r==="setter"){const{name:o}=t;return function(l){const u=this[o];i.call(this,l),this.requestUpdate(o,u,e)}}throw Error("Unsupported decorator location: "+r)};function Ye(e){return(i,t)=>typeof t=="object"?co(e,i,t):((r,n,a)=>{const o=n.hasOwnProperty(a);return n.constructor.createProperty(a,r),o?Object.getOwnPropertyDescriptor(n,a):void 0})(e,i,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function $e(e){return Ye({...e,state:!0,attribute:!1})}var zn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function _u(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Ln={};/*! *****************************************************************************
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
***************************************************************************** */var Bn;function ho(){if(Bn)return Ln;Bn=1;var e;return function(i){(function(t){var r=typeof globalThis=="object"?globalThis:typeof zn=="object"?zn:typeof self=="object"?self:typeof this=="object"?this:u(),n=a(i);typeof r.Reflect<"u"&&(n=a(r.Reflect,n)),t(n,r),typeof r.Reflect>"u"&&(r.Reflect=i);function a(c,h){return function(x,y){Object.defineProperty(c,x,{configurable:!0,writable:!0,value:y}),h&&h(x,y)}}function o(){try{return Function("return this;")()}catch{}}function l(){try{return(0,eval)("(function() { return this; })()")}catch{}}function u(){return o()||l()}})(function(t,r){var n=Object.prototype.hasOwnProperty,a=typeof Symbol=="function",o=a&&typeof Symbol.toPrimitive<"u"?Symbol.toPrimitive:"@@toPrimitive",l=a&&typeof Symbol.iterator<"u"?Symbol.iterator:"@@iterator",u=typeof Object.create=="function",c={__proto__:[]}instanceof Array,h=!u&&!c,x={create:u?function(){return dt(Object.create(null))}:c?function(){return dt({__proto__:null})}:function(){return dt({})},has:h?function(b,w){return n.call(b,w)}:function(b,w){return w in b},get:h?function(b,w){return n.call(b,w)?b[w]:void 0}:function(b,w){return b[w]}},y=Object.getPrototypeOf(Function),v=typeof Map=="function"&&typeof Map.prototype.entries=="function"?Map:Ii(),E=typeof Set=="function"&&typeof Set.prototype.entries=="function"?Set:br(),H=typeof WeakMap=="function"?WeakMap:ct(),M=a?Symbol.for("@reflect-metadata:registry"):void 0,O=ot(),q=Wt(O);function I(b,w,S,T){if(j(S)){if(!Ri(b))throw new TypeError;if(!Je(w))throw new TypeError;return He(b,w)}else{if(!Ri(b))throw new TypeError;if(!fe(w))throw new TypeError;if(!fe(T)&&!j(T)&&!Me(T))throw new TypeError;return Me(T)&&(T=void 0),S=Te(S),Oe(b,w,S,T)}}t("decorate",I);function P(b,w){function S(T,F){if(!fe(T))throw new TypeError;if(!j(F)&&!pr(F))throw new TypeError;Ie(b,w,T,F)}return S}t("metadata",P);function X(b,w,S,T){if(!fe(S))throw new TypeError;return j(T)||(T=Te(T)),Ie(b,w,S,T)}t("defineMetadata",X);function ce(b,w,S){if(!fe(w))throw new TypeError;return j(S)||(S=Te(S)),De(b,w,S)}t("hasMetadata",ce);function D(b,w,S){if(!fe(w))throw new TypeError;return j(S)||(S=Te(S)),le(b,w,S)}t("hasOwnMetadata",D);function te(b,w,S){if(!fe(w))throw new TypeError;return j(S)||(S=Te(S)),Ft(b,w,S)}t("getMetadata",te);function G(b,w,S){if(!fe(w))throw new TypeError;return j(S)||(S=Te(S)),Pi(b,w,S)}t("getOwnMetadata",G);function z(b,w){if(!fe(b))throw new TypeError;return j(w)||(w=Te(w)),Nt(b,w)}t("getMetadataKeys",z);function W(b,w){if(!fe(b))throw new TypeError;return j(w)||(w=Te(w)),Zt(b,w)}t("getOwnMetadataKeys",W);function Ae(b,w,S){if(!fe(w))throw new TypeError;if(j(S)||(S=Te(S)),!fe(w))throw new TypeError;j(S)||(S=Te(S));var T=lt(w,S,!1);return j(T)?!1:T.OrdinaryDeleteMetadata(b,w,S)}t("deleteMetadata",Ae);function He(b,w){for(var S=b.length-1;S>=0;--S){var T=b[S],F=T(w);if(!j(F)&&!Me(F)){if(!Je(F))throw new TypeError;w=F}}return w}function Oe(b,w,S,T){for(var F=b.length-1;F>=0;--F){var ue=b[F],d=ue(w,S,T);if(!j(d)&&!Me(d)){if(!fe(d))throw new TypeError;T=d}}return T}function De(b,w,S){var T=le(b,w,S);if(T)return!0;var F=Gt(w);return Me(F)?!1:De(b,F,S)}function le(b,w,S){var T=lt(w,S,!1);return j(T)?!1:Pe(T.OrdinaryHasOwnMetadata(b,w,S))}function Ft(b,w,S){var T=le(b,w,S);if(T)return Pi(b,w,S);var F=Gt(w);if(!Me(F))return Ft(b,F,S)}function Pi(b,w,S){var T=lt(w,S,!1);if(!j(T))return T.OrdinaryGetOwnMetadata(b,w,S)}function Ie(b,w,S,T){var F=lt(S,T,!0);F.OrdinaryDefineOwnMetadata(b,w,S,T)}function Nt(b,w){var S=Zt(b,w),T=Gt(b);if(T===null)return S;var F=Nt(T,w);if(F.length<=0)return S;if(S.length<=0)return F;for(var ue=new E,d=[],f=0,s=S;f<s.length;f++){var g=s[f],m=ue.has(g);m||(ue.add(g),d.push(g))}for(var p=0,A=F;p<A.length;p++){var g=A[p],m=ue.has(g);m||(ue.add(g),d.push(g))}return d}function Zt(b,w){var S=lt(b,w,!1);return S?S.OrdinaryOwnMetadataKeys(b,w):[]}function Ht(b){if(b===null)return 1;switch(typeof b){case"undefined":return 0;case"boolean":return 2;case"string":return 3;case"symbol":return 4;case"number":return 5;case"object":return b===null?1:6;default:return 6}}function j(b){return b===void 0}function Me(b){return b===null}function jt(b){return typeof b=="symbol"}function fe(b){return typeof b=="object"?b!==null:typeof b=="function"}function ur(b,w){switch(Ht(b)){case 0:return b;case 1:return b;case 2:return b;case 3:return b;case 4:return b;case 5:return b}var S="string",T=Ui(b,o);if(T!==void 0){var F=T.call(b,S);if(fe(F))throw new TypeError;return F}return Ti(b)}function Ti(b,w){var S,T,F;{var ue=b.toString;if(st(ue)){var T=ue.call(b);if(!fe(T))return T}var S=b.valueOf;if(st(S)){var T=S.call(b);if(!fe(T))return T}}throw new TypeError}function Pe(b){return!!b}function fr(b){return""+b}function Te(b){var w=ur(b);return jt(w)?w:fr(w)}function Ri(b){return Array.isArray?Array.isArray(b):b instanceof Object?b instanceof Array:Object.prototype.toString.call(b)==="[object Array]"}function st(b){return typeof b=="function"}function Je(b){return typeof b=="function"}function pr(b){switch(Ht(b)){case 3:return!0;case 4:return!0;default:return!1}}function qt(b,w){return b===w||b!==b&&w!==w}function Ui(b,w){var S=b[w];if(S!=null){if(!st(S))throw new TypeError;return S}}function At(b){var w=Ui(b,l);if(!st(w))throw new TypeError;var S=w.call(b);if(!fe(S))throw new TypeError;return S}function Oi(b){return b.value}function Di(b){var w=b.next();return w.done?!1:w}function Vt(b){var w=b.return;w&&w.call(b)}function Gt(b){var w=Object.getPrototypeOf(b);if(typeof b!="function"||b===y||w!==y)return w;var S=b.prototype,T=S&&Object.getPrototypeOf(S);if(T==null||T===Object.prototype)return w;var F=T.constructor;return typeof F!="function"||F===b?w:F}function gr(){var b;!j(M)&&typeof r.Reflect<"u"&&!(M in r.Reflect)&&typeof r.Reflect.defineMetadata=="function"&&(b=Yt(r.Reflect));var w,S,T,F=new H,ue={registerProvider:d,getProvider:s,setProvider:m};return ue;function d(p){if(!Object.isExtensible(ue))throw new Error("Cannot add provider to a frozen registry.");switch(!0){case b===p:break;case j(w):w=p;break;case w===p:break;case j(S):S=p;break;case S===p:break;default:T===void 0&&(T=new E),T.add(p);break}}function f(p,A){if(!j(w)){if(w.isProviderFor(p,A))return w;if(!j(S)){if(S.isProviderFor(p,A))return w;if(!j(T))for(var $=At(T);;){var L=Di($);if(!L)return;var _=Oi(L);if(_.isProviderFor(p,A))return Vt($),_}}}if(!j(b)&&b.isProviderFor(p,A))return b}function s(p,A){var $=F.get(p),L;return j($)||(L=$.get(A)),j(L)&&(L=f(p,A),j(L)||(j($)&&($=new v,F.set(p,$)),$.set(A,L))),L}function g(p){if(j(p))throw new TypeError;return w===p||S===p||!j(T)&&T.has(p)}function m(p,A,$){if(!g($))throw new Error("Metadata provider not registered.");var L=s(p,A);if(L!==$){if(!j(L))return!1;var _=F.get(p);j(_)&&(_=new v,F.set(p,_)),_.set(A,$)}return!0}}function ot(){var b;return!j(M)&&fe(r.Reflect)&&Object.isExtensible(r.Reflect)&&(b=r.Reflect[M]),j(b)&&(b=gr()),!j(M)&&fe(r.Reflect)&&Object.isExtensible(r.Reflect)&&Object.defineProperty(r.Reflect,M,{enumerable:!1,configurable:!1,writable:!1,value:b}),b}function Wt(b){var w=new H,S={isProviderFor:function(g,m){var p=w.get(g);return j(p)?!1:p.has(m)},OrdinaryDefineOwnMetadata:d,OrdinaryHasOwnMetadata:F,OrdinaryGetOwnMetadata:ue,OrdinaryOwnMetadataKeys:f,OrdinaryDeleteMetadata:s};return O.registerProvider(S),S;function T(g,m,p){var A=w.get(g),$=!1;if(j(A)){if(!p)return;A=new v,w.set(g,A),$=!0}var L=A.get(m);if(j(L)){if(!p)return;if(L=new v,A.set(m,L),!b.setProvider(g,m,S))throw A.delete(m),$&&w.delete(g),new Error("Wrong provider for target.")}return L}function F(g,m,p){var A=T(m,p,!1);return j(A)?!1:Pe(A.has(g))}function ue(g,m,p){var A=T(m,p,!1);if(!j(A))return A.get(g)}function d(g,m,p,A){var $=T(p,A,!0);$.set(g,m)}function f(g,m){var p=[],A=T(g,m,!1);if(j(A))return p;for(var $=A.keys(),L=At($),_=0;;){var k=Di(L);if(!k)return p.length=_,p;var be=Oi(k);try{p[_]=be}catch(Z){try{Vt(L)}finally{throw Z}}_++}}function s(g,m,p){var A=T(m,p,!1);if(j(A)||!A.delete(g))return!1;if(A.size===0){var $=w.get(m);j($)||($.delete(p),$.size===0&&w.delete($))}return!0}}function Yt(b){var w=b.defineMetadata,S=b.hasOwnMetadata,T=b.getOwnMetadata,F=b.getOwnMetadataKeys,ue=b.deleteMetadata,d=new H,f={isProviderFor:function(s,g){var m=d.get(s);return!j(m)&&m.has(g)?!0:F(s,g).length?(j(m)&&(m=new E,d.set(s,m)),m.add(g),!0):!1},OrdinaryDefineOwnMetadata:w,OrdinaryHasOwnMetadata:S,OrdinaryGetOwnMetadata:T,OrdinaryOwnMetadataKeys:F,OrdinaryDeleteMetadata:ue};return f}function lt(b,w,S){var T=O.getProvider(b,w);if(!j(T))return T;if(S){if(O.setProvider(b,w,q))return q;throw new Error("Illegal state.")}}function Ii(){var b={},w=[],S=function(){function f(s,g,m){this._index=0,this._keys=s,this._values=g,this._selector=m}return f.prototype["@@iterator"]=function(){return this},f.prototype[l]=function(){return this},f.prototype.next=function(){var s=this._index;if(s>=0&&s<this._keys.length){var g=this._selector(this._keys[s],this._values[s]);return s+1>=this._keys.length?(this._index=-1,this._keys=w,this._values=w):this._index++,{value:g,done:!1}}return{value:void 0,done:!0}},f.prototype.throw=function(s){throw this._index>=0&&(this._index=-1,this._keys=w,this._values=w),s},f.prototype.return=function(s){return this._index>=0&&(this._index=-1,this._keys=w,this._values=w),{value:s,done:!0}},f}(),T=function(){function f(){this._keys=[],this._values=[],this._cacheKey=b,this._cacheIndex=-2}return Object.defineProperty(f.prototype,"size",{get:function(){return this._keys.length},enumerable:!0,configurable:!0}),f.prototype.has=function(s){return this._find(s,!1)>=0},f.prototype.get=function(s){var g=this._find(s,!1);return g>=0?this._values[g]:void 0},f.prototype.set=function(s,g){var m=this._find(s,!0);return this._values[m]=g,this},f.prototype.delete=function(s){var g=this._find(s,!1);if(g>=0){for(var m=this._keys.length,p=g+1;p<m;p++)this._keys[p-1]=this._keys[p],this._values[p-1]=this._values[p];return this._keys.length--,this._values.length--,qt(s,this._cacheKey)&&(this._cacheKey=b,this._cacheIndex=-2),!0}return!1},f.prototype.clear=function(){this._keys.length=0,this._values.length=0,this._cacheKey=b,this._cacheIndex=-2},f.prototype.keys=function(){return new S(this._keys,this._values,F)},f.prototype.values=function(){return new S(this._keys,this._values,ue)},f.prototype.entries=function(){return new S(this._keys,this._values,d)},f.prototype["@@iterator"]=function(){return this.entries()},f.prototype[l]=function(){return this.entries()},f.prototype._find=function(s,g){if(!qt(this._cacheKey,s)){this._cacheIndex=-1;for(var m=0;m<this._keys.length;m++)if(qt(this._keys[m],s)){this._cacheIndex=m;break}}return this._cacheIndex<0&&g&&(this._cacheIndex=this._keys.length,this._keys.push(s),this._values.push(void 0)),this._cacheIndex},f}();return T;function F(f,s){return f}function ue(f,s){return s}function d(f,s){return[f,s]}}function br(){var b=function(){function w(){this._map=new v}return Object.defineProperty(w.prototype,"size",{get:function(){return this._map.size},enumerable:!0,configurable:!0}),w.prototype.has=function(S){return this._map.has(S)},w.prototype.add=function(S){return this._map.set(S,S),this},w.prototype.delete=function(S){return this._map.delete(S)},w.prototype.clear=function(){this._map.clear()},w.prototype.keys=function(){return this._map.keys()},w.prototype.values=function(){return this._map.keys()},w.prototype.entries=function(){return this._map.entries()},w.prototype["@@iterator"]=function(){return this.keys()},w.prototype[l]=function(){return this.keys()},w}();return b}function ct(){var b=16,w=x.create(),S=T();return function(){function s(){this._key=T()}return s.prototype.has=function(g){var m=F(g,!1);return m!==void 0?x.has(m,this._key):!1},s.prototype.get=function(g){var m=F(g,!1);return m!==void 0?x.get(m,this._key):void 0},s.prototype.set=function(g,m){var p=F(g,!0);return p[this._key]=m,this},s.prototype.delete=function(g){var m=F(g,!1);return m!==void 0?delete m[this._key]:!1},s.prototype.clear=function(){this._key=T()},s}();function T(){var s;do s="@@WeakMap@@"+f();while(x.has(w,s));return w[s]=!0,s}function F(s,g){if(!n.call(s,S)){if(!g)return;Object.defineProperty(s,S,{value:x.create()})}return s[S]}function ue(s,g){for(var m=0;m<g;++m)s[m]=Math.random()*255|0;return s}function d(s){if(typeof Uint8Array=="function"){var g=new Uint8Array(s);return typeof crypto<"u"?crypto.getRandomValues(g):typeof msCrypto<"u"?msCrypto.getRandomValues(g):ue(g,s),g}return ue(new Array(s),s)}function f(){var s=d(b);s[6]=s[6]&79|64,s[8]=s[8]&191|128;for(var g="",m=0;m<b;++m){var p=s[m];(m===4||m===6||m===8)&&(g+="-"),p<16&&(g+="0"),g+=p.toString(16).toLowerCase()}return g}}function dt(b){return b.__=void 0,delete b.__,b}})}(e||(e={})),Ln}ho();const mt={Singleton:0,Transient:2};class ut{constructor(){this.services=new Map,this.singletonInstances=new Map,this.tokenRegistry=new Map}static getInstance(){return ut.instance||(ut.instance=new ut),ut.instance}addService(i,t,r){this.services.set(i,{token:i,implementation:t,lifetime:r}),r===mt.Singleton&&(this.singletonInstances.has(i)||this.singletonInstances.set(i,new t))}getOrCreateToken(i){const t=i.name;return this.tokenRegistry.has(t)||this.tokenRegistry.set(t,Symbol(t)),this.tokenRegistry.get(t)}getService(i){const t=this.services.get(i);if(!t)throw new Error(`Service not registered for token: ${i.toString()}`);switch(t.lifetime){case mt.Singleton:return this.getSingletonInstance(t);case mt.Transient:return new t.implementation;default:throw new Error(`Unsupported lifetime: ${t.lifetime}`)}}getSingletonInstance(i){return this.singletonInstances.has(i.token)||this.singletonInstances.set(i.token,new i.implementation),this.singletonInstances.get(i.token)}}function vi(e=mt.Singleton){return function(i){const t=ut.getInstance(),r=t.getOrCreateToken(i);return t.addService(r,i,e),i}}function Mt(e){return function(i,t){const r=e||Reflect.getMetadata("design:type",i,t);if(!r)throw new Error(`Cannot resolve type for property '${t}'. Make sure emitDecoratorMetadata is enabled.`);const n=ut.getInstance(),a=n.getOrCreateToken(r);Object.defineProperty(i,t,{get:function(){return n.getService(a)},enumerable:!0,configurable:!0})}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ln=globalThis,Yi=ln.trustedTypes,Fn=Yi?Yi.createPolicy("lit-html",{createHTML:e=>e}):void 0,Va="$lit$",Qe=`lit$${Math.random().toFixed(9).slice(2)}$`,Ga="?"+Qe,uo=`<${Ga}>`,wt=document,li=()=>wt.createComment(""),ci=e=>e===null||typeof e!="object"&&typeof e!="function",cn=Array.isArray,fo=e=>cn(e)||typeof e?.[Symbol.iterator]=="function",mr=`[ 	
\f\r]`,Xt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Nn=/-->/g,Zn=/>/g,ht=RegExp(`>|${mr}(?:([^\\s"'>=/]+)(${mr}*=${mr}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Hn=/'/g,jn=/"/g,Wa=/^(?:script|style|textarea|title)$/i,po=e=>(i,...t)=>({_$litType$:e,strings:i,values:t}),U=po(1),_t=Symbol.for("lit-noChange"),pe=Symbol.for("lit-nothing"),qn=new WeakMap,ft=wt.createTreeWalker(wt,129);function Ya(e,i){if(!cn(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Fn!==void 0?Fn.createHTML(i):i}const go=(e,i)=>{const t=e.length-1,r=[];let n,a=i===2?"<svg>":i===3?"<math>":"",o=Xt;for(let l=0;l<t;l++){const u=e[l];let c,h,x=-1,y=0;for(;y<u.length&&(o.lastIndex=y,h=o.exec(u),h!==null);)y=o.lastIndex,o===Xt?h[1]==="!--"?o=Nn:h[1]!==void 0?o=Zn:h[2]!==void 0?(Wa.test(h[2])&&(n=RegExp("</"+h[2],"g")),o=ht):h[3]!==void 0&&(o=ht):o===ht?h[0]===">"?(o=n??Xt,x=-1):h[1]===void 0?x=-2:(x=o.lastIndex-h[2].length,c=h[1],o=h[3]===void 0?ht:h[3]==='"'?jn:Hn):o===jn||o===Hn?o=ht:o===Nn||o===Zn?o=Xt:(o=ht,n=void 0);const v=o===ht&&e[l+1].startsWith("/>")?" ":"";a+=o===Xt?u+uo:x>=0?(r.push(c),u.slice(0,x)+Va+u.slice(x)+Qe+v):u+Qe+(x===-2?l:v)}return[Ya(e,a+(e[t]||"<?>")+(i===2?"</svg>":i===3?"</math>":"")),r]};let Or=class Ka{constructor({strings:i,_$litType$:t},r){let n;this.parts=[];let a=0,o=0;const l=i.length-1,u=this.parts,[c,h]=go(i,t);if(this.el=Ka.createElement(c,r),ft.currentNode=this.el.content,t===2||t===3){const x=this.el.content.firstChild;x.replaceWith(...x.childNodes)}for(;(n=ft.nextNode())!==null&&u.length<l;){if(n.nodeType===1){if(n.hasAttributes())for(const x of n.getAttributeNames())if(x.endsWith(Va)){const y=h[o++],v=n.getAttribute(x).split(Qe),E=/([.?@])?(.*)/.exec(y);u.push({type:1,index:a,name:E[2],strings:v,ctor:E[1]==="."?mo:E[1]==="?"?wo:E[1]==="@"?_o:sr}),n.removeAttribute(x)}else x.startsWith(Qe)&&(u.push({type:6,index:a}),n.removeAttribute(x));if(Wa.test(n.tagName)){const x=n.textContent.split(Qe),y=x.length-1;if(y>0){n.textContent=Yi?Yi.emptyScript:"";for(let v=0;v<y;v++)n.append(x[v],li()),ft.nextNode(),u.push({type:2,index:++a});n.append(x[y],li())}}}else if(n.nodeType===8)if(n.data===Ga)u.push({type:2,index:a});else{let x=-1;for(;(x=n.data.indexOf(Qe,x+1))!==-1;)u.push({type:7,index:a}),x+=Qe.length-1}a++}}static createElement(i,t){const r=wt.createElement("template");return r.innerHTML=i,r}};function Ut(e,i,t=e,r){if(i===_t)return i;let n=r!==void 0?t._$Co?.[r]:t._$Cl;const a=ci(i)?void 0:i._$litDirective$;return n?.constructor!==a&&(n?._$AO?.(!1),a===void 0?n=void 0:(n=new a(e),n._$AT(e,t,r)),r!==void 0?(t._$Co??=[])[r]=n:t._$Cl=n),n!==void 0&&(i=Ut(e,n._$AS(e,i.values),n,r)),i}let bo=class{constructor(i,t){this._$AV=[],this._$AN=void 0,this._$AD=i,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(i){const{el:{content:t},parts:r}=this._$AD,n=(i?.creationScope??wt).importNode(t,!0);ft.currentNode=n;let a=ft.nextNode(),o=0,l=0,u=r[0];for(;u!==void 0;){if(o===u.index){let c;u.type===2?c=new dn(a,a.nextSibling,this,i):u.type===1?c=new u.ctor(a,u.name,u.strings,this,i):u.type===6&&(c=new vo(a,this,i)),this._$AV.push(c),u=r[++l]}o!==u?.index&&(a=ft.nextNode(),o++)}return ft.currentNode=wt,n}p(i){let t=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(i,r,t),t+=r.strings.length-2):r._$AI(i[t])),t++}},dn=class Xa{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(i,t,r,n){this.type=2,this._$AH=pe,this._$AN=void 0,this._$AA=i,this._$AB=t,this._$AM=r,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let i=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&i?.nodeType===11&&(i=t.parentNode),i}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(i,t=this){i=Ut(this,i,t),ci(i)?i===pe||i==null||i===""?(this._$AH!==pe&&this._$AR(),this._$AH=pe):i!==this._$AH&&i!==_t&&this._(i):i._$litType$!==void 0?this.$(i):i.nodeType!==void 0?this.T(i):fo(i)?this.k(i):this._(i)}O(i){return this._$AA.parentNode.insertBefore(i,this._$AB)}T(i){this._$AH!==i&&(this._$AR(),this._$AH=this.O(i))}_(i){this._$AH!==pe&&ci(this._$AH)?this._$AA.nextSibling.data=i:this.T(wt.createTextNode(i)),this._$AH=i}$(i){const{values:t,_$litType$:r}=i,n=typeof r=="number"?this._$AC(i):(r.el===void 0&&(r.el=Or.createElement(Ya(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===n)this._$AH.p(t);else{const a=new bo(n,this),o=a.u(this.options);a.p(t),this.T(o),this._$AH=a}}_$AC(i){let t=qn.get(i.strings);return t===void 0&&qn.set(i.strings,t=new Or(i)),t}k(i){cn(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let r,n=0;for(const a of i)n===t.length?t.push(r=new Xa(this.O(li()),this.O(li()),this,this.options)):r=t[n],r._$AI(a),n++;n<t.length&&(this._$AR(r&&r._$AB.nextSibling,n),t.length=n)}_$AR(i=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);i!==this._$AB;){const r=i.nextSibling;i.remove(),i=r}}setConnected(i){this._$AM===void 0&&(this._$Cv=i,this._$AP?.(i))}},sr=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(i,t,r,n,a){this.type=1,this._$AH=pe,this._$AN=void 0,this.element=i,this.name=t,this._$AM=n,this.options=a,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=pe}_$AI(i,t=this,r,n){const a=this.strings;let o=!1;if(a===void 0)i=Ut(this,i,t,0),o=!ci(i)||i!==this._$AH&&i!==_t,o&&(this._$AH=i);else{const l=i;let u,c;for(i=a[0],u=0;u<a.length-1;u++)c=Ut(this,l[r+u],t,u),c===_t&&(c=this._$AH[u]),o||=!ci(c)||c!==this._$AH[u],c===pe?i=pe:i!==pe&&(i+=(c??"")+a[u+1]),this._$AH[u]=c}o&&!n&&this.j(i)}j(i){i===pe?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,i??"")}},mo=class extends sr{constructor(){super(...arguments),this.type=3}j(i){this.element[this.name]=i===pe?void 0:i}},wo=class extends sr{constructor(){super(...arguments),this.type=4}j(i){this.element.toggleAttribute(this.name,!!i&&i!==pe)}},_o=class extends sr{constructor(i,t,r,n,a){super(i,t,r,n,a),this.type=5}_$AI(i,t=this){if((i=Ut(this,i,t,0)??pe)===_t)return;const r=this._$AH,n=i===pe&&r!==pe||i.capture!==r.capture||i.once!==r.once||i.passive!==r.passive,a=i!==pe&&(r===pe||n);n&&this.element.removeEventListener(this.name,this,r),a&&this.element.addEventListener(this.name,this,i),this._$AH=i}handleEvent(i){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,i):this._$AH.handleEvent(i)}},vo=class{constructor(i,t,r){this.element=i,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(i){Ut(this,i)}};const yo=ln.litHtmlPolyfillSupport;yo?.(Or,dn),(ln.litHtmlVersions??=[]).push("3.3.1");const ko=(e,i,t)=>{const r=t?.renderBefore??i;let n=r._$litPart$;if(n===void 0){const a=t?.renderBefore??null;r._$litPart$=n=new dn(i.insertBefore(li(),a),a,void 0,t??{})}return n._$AI(e),n};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const hn=globalThis;let Tt=class extends Pt{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const i=super.createRenderRoot();return this.renderOptions.renderBefore??=i.firstChild,i}update(i){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(i),this._$Do=ko(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _t}};Tt._$litElement$=!0,Tt.finalized=!0,hn.litElementHydrateSupport?.({LitElement:Tt});const xo=hn.litElementPolyfillSupport;xo?.({LitElement:Tt});(hn.litElementVersions??=[]).push("4.2.1");class So{update(i){i.title&&(document.title=i.title);let t=document.querySelector('meta[name="description"]');t||(t=document.createElement("meta"),t.setAttribute("name","description"),document.head.appendChild(t)),t.setAttribute("content",i.description||"")}}const wr=new So;var $o=Object.defineProperty,Ao=Object.getOwnPropertyDescriptor,un=(e,i,t,r)=>{for(var n=r>1?void 0:r?Ao(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&$o(i,t,n),n};let Ki=class extends Tt{constructor(){super(...arguments),this.currentPath="",this.handleNavigation=()=>{const e=window.location.hash;let i=e?e.substring(1):"";const[t]=i.split("?");let r=t;r.startsWith("/")||(r="/"+r),this.currentPath=r,this.requestUpdate()}}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleNavigation),this.handleNavigation()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleNavigation)}createRenderRoot(){return this}render(){for(const[e,i]of Ja.entries()){const t=new RegExp("^"+e.replace(/:[^\s/]+/g,"([\\w-]+)")+"$"),r=this.currentPath.match(t);if(r){i.metadata?wr.update(i.metadata):wr.update({title:"PlayableTools"});const n=r.slice(1),a=new i.component;return a.routeParams=n,this.renderContentWithLayout(()=>U`<div>${a}</div>`)}}return wr.update({title:"Page Not Found"}),this.renderContentWithLayout(()=>U`<h1>404 Not Found</h1>`)}renderContentWithLayout(e){if(!this.defaultLayout)return e();const i=new this.defaultLayout;return i.body=e(),U`
            <div>${i}</div>
        `}};un([Ye({attribute:!1})],Ki.prototype,"defaultLayout",2);un([$e()],Ki.prototype,"currentPath",2);Ki=un([we("router-outlet")],Ki);const Ja=new Map;function Ke(e,i){return function(t){return Ja.set(e,{component:t,metadata:i}),t}}function Eo(e){return function(i,t){Object.defineProperty(i,t,{get:function(){const n=window.location.hash;if(n){const a=n.indexOf("?");if(a!==-1){const o=n.substring(a+1);return new URLSearchParams(o).get(e)}}return null},enumerable:!0,configurable:!0})}}const Un=class Un extends Tt{createRenderRoot(){return this.constructor.useShadowDom?super.createRenderRoot():this}};Un.useShadowDom=!1;let ge=Un;class Co extends ge{}var Po=Object.defineProperty,To=Object.getOwnPropertyDescriptor,yi=(e,i,t,r)=>{for(var n=r>1?void 0:r?To(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&Po(i,t,n),n};let Ot=class extends ge{constructor(){super(...arguments),this.open=!1,this.src="",this.alt="",this.thumbWidth="500px",this.openPopup=()=>{this.open=!0,this.requestUpdate()},this.closePopup=()=>{this.open=!1,this.requestUpdate()}}render(){return U`
      <img
        src="${this.src}"
        alt="${this.alt}"
        style="max-width: ${this.thumbWidth}; display: block; margin: 1em auto; border: 1px solid #ccc; border-radius: 8px; cursor: zoom-in;"
        @click=${this.openPopup}
      />
      ${this.open?U`
        <div
          style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;"
          @click=${this.closePopup}
        >
          <img
            src="${this.src}"
            alt="${this.alt} full size"
            style="max-width:90vw;max-height:90vh;box-shadow:0 0 32px #000;border-radius:12px;"
            @click=${e=>e.stopPropagation()}
          />
          <button
            style="position:absolute;top:32px;right:48px;font-size:2rem;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:48px;height:48px;cursor:pointer;"
            @click=${this.closePopup}
            aria-label="Close preview"
          >×</button>
        </div>
      `:""}
    `}};yi([Ye({type:Boolean})],Ot.prototype,"open",2);yi([Ye({type:String})],Ot.prototype,"src",2);yi([Ye({type:String})],Ot.prototype,"alt",2);yi([Ye({type:String})],Ot.prototype,"thumbWidth",2);Ot=yi([we("image-popup")],Ot);var Ro=Object.defineProperty,Uo=Object.getOwnPropertyDescriptor,Qa=(e,i,t,r)=>{for(var n=r>1?void 0:r?Uo(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&Ro(i,t,n),n};let di=class extends ge{constructor(){super(...arguments),this.visible=!1}show(){this.visible=!0}hide(){this.visible=!1}handleReload(){this.dispatchEvent(new CustomEvent("reload-requested",{bubbles:!0,composed:!0}))}render(){return U`
      <div class="notification ${this.visible?"visible":""}">
        <div class="notification-content">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <div class="notification-message">
            A new version is available with latest features and improvements
          </div>
          <button class="reload-btn" @click=${this.handleReload}>
            <svg class="reload-icon" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Reload App
          </button>
        </div>
      </div>
    `}};di.useShadowDom=!0;di.styles=qa`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .notification {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transform: translateY(-100%);
      transition: transform 0.3s ease-in-out;
    }

    .notification.visible {
      transform: translateY(0);
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      justify-content: center;
      max-width: 600px;
    }

    .notification-message {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }

    .reload-btn {
      background: white;
      color: #3b82f6;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .reload-btn:hover {
      background: #f8fafc;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .icon {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .reload-icon {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    @media (max-width: 768px) {
      .notification {
        padding: 10px 16px;
        text-align: center;
      }
      
      .notification-content {
        flex-direction: column;
        gap: 8px;
      }
      
      .notification-message {
        font-size: 13px;
      }
      
      .reload-btn {
        padding: 6px 12px;
        font-size: 12px;
      }
    }
  `;Qa([$e()],di.prototype,"visible",2);di=Qa([we("update-notification")],di);class fn{constructor(i=60*60*1e3,t="./version.json"){this.currentVersion=null,this.checkInterval=null,this.listeners=[],this.isPWA=!1,this.checkIntervalMs=i,this.versionEndpoint=t,this.detectPWAMode()}detectPWAMode(){this.isPWA=window.matchMedia("(display-mode: standalone)").matches||window.matchMedia("(display-mode: fullscreen)").matches||window.navigator.standalone===!0||document.referrer.includes("android-app://"),this.isPWA&&console.log("VersionService: Running in PWA mode")}async initialize(){try{this.currentVersion=await this.fetchVersionInfo(),console.log(`🚀 PlayableTools v${this.currentVersion.version}`),console.log(`📦 Build: ${this.currentVersion.buildTime}`),console.log(`🔖 Hash: ${this.currentVersion.hash}`),this.isPWA&&console.log("📱 Running in PWA mode"),this.startPeriodicCheck()}catch(i){console.warn("Failed to initialize version service:",i),this.currentVersion={version:"1.0.4",buildTime:new Date().toISOString(),hash:"fallback"},console.log(`🚀 PlayableTools v${this.currentVersion.version} (fallback)`),console.log("⚠️ Could not fetch version from server, using fallback")}}startPeriodicCheck(){this.checkInterval&&clearInterval(this.checkInterval),this.checkInterval=window.setInterval(async()=>{await this.checkForUpdates()},this.checkIntervalMs)}stopPeriodicCheck(){this.checkInterval&&(clearInterval(this.checkInterval),this.checkInterval=null)}async checkForUpdates(){try{const i=await this.fetchVersionInfo();return this.currentVersion&&this.hasNewVersion(this.currentVersion,i)?(console.log("🆕 Update available!"),console.log(`📍 Current: v${this.currentVersion.version} (${this.currentVersion.hash})`),console.log(`🎯 Latest: v${i.version} (${i.hash})`),this.notifyListeners(!0),!0):(console.log("✅ App is up to date"),!1)}catch(i){return console.warn("Failed to check for updates:",i),!1}}async testCacheBusting(){console.log("🧪 Testing cache busting...");try{const i=[];for(let a=0;a<3;a++)i.push(this.fetchVersionInfo()),await new Promise(o=>setTimeout(o,100));const t=await Promise.all(i);console.log("🧪 Cache busting test results:"),t.forEach((a,o)=>{console.log(`Request ${o+1}:`,a)});const r=t.map(a=>a.buildTime);new Set(r).size===1?console.log("✅ Cache busting working correctly - all requests returned same data"):console.log("⚠️ Inconsistent responses - possible caching issues")}catch(i){console.error("🧪 Cache busting test failed:",i)}}async fetchVersionInfo(){if("serviceWorker"in navigator&&navigator.serviceWorker.controller)try{const t=await this.fetchVersionViaServiceWorker();if(t)return t}catch(t){console.warn("Failed to fetch version via service worker, falling back to direct fetch:",t)}const i=[()=>this.fetchVersionDirect(),()=>this.fetchVersionWithDifferentMethod(),()=>this.fetchVersionFallback()];for(let t=0;t<i.length;t++)try{console.log(`📡 Trying fetch strategy ${t+1}/${i.length}`);const r=await i[t]();return console.log(`✅ Strategy ${t+1} succeeded`),r}catch(r){if(console.warn(`❌ Strategy ${t+1} failed:`,r),t===i.length-1)throw r}throw new Error("All fetch strategies failed")}async fetchVersionViaServiceWorker(){return new Promise((i,t)=>{if(!navigator.serviceWorker.controller){t(new Error("No service worker controller"));return}const r=new MessageChannel;r.port1.onmessage=n=>{const{type:a,data:o,error:l}=n.data;a==="VERSION_INFO"?i(o):a==="VERSION_ERROR"&&t(new Error(l))},navigator.serviceWorker.controller.postMessage({type:"CHECK_VERSION"},[r.port2]),setTimeout(()=>{t(new Error("Service worker version check timeout"))},5e3)})}async fetchVersionDirect(){let i=this.versionEndpoint;window.location.origin==="https://gritsenko.biz"&&window.location.pathname.startsWith("/PlayableTools/")&&(i="/PlayableTools/version.json");const t=`?v=${Date.now()}&cb=${Math.random().toString(36).substring(2)}&nc=${performance.now()}`,r=i+t;console.log(`📡 Fetching version from: ${r}`);const n=await fetch(r,{method:"GET",headers:{"Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache",Expires:"0"},cache:"no-store",mode:"cors",credentials:"same-origin"});if(!n.ok&&n.status!==304)throw new Error(`Failed to fetch version info from ${r}: ${n.status} ${n.statusText}`);let a;try{a=await n.json(),console.log("📡 Version info fetched from server:",a)}catch{console.warn("📡 Could not parse JSON response, using fallback version data"),a={version:"1.0.4",buildTime:new Date().toISOString(),hash:"fallback"}}return console.log("🔍 Response status:",n.status),console.log("🔍 Response headers cache-control:",n.headers.get("cache-control")),a}async fetchVersionWithDifferentMethod(){return new Promise((i,t)=>{let r=this.versionEndpoint;window.location.origin==="https://gritsenko.biz"&&window.location.pathname.startsWith("/PlayableTools/")&&(r="/PlayableTools/version.json");const n=`?xhr=${Date.now()}&rand=${Math.random()}`,a=r+n,o=new XMLHttpRequest;o.open("GET",a,!0),o.setRequestHeader("Cache-Control","no-cache, no-store, must-revalidate"),o.setRequestHeader("Pragma","no-cache"),o.setRequestHeader("Expires","0"),o.onreadystatechange=function(){if(o.readyState===4)if(o.status===200||o.status===304)try{const l=JSON.parse(o.responseText);console.log("📡 XHR version fetch successful:",l),i(l)}catch{t(new Error("Failed to parse JSON from XHR response"))}else t(new Error(`XHR request failed: ${o.status}`))},o.onerror=()=>t(new Error("XHR request error")),o.send()})}async fetchVersionFallback(){return console.log("📡 Using final fallback version"),{version:"1.0.4",buildTime:new Date().toISOString(),hash:"final-fallback"}}hasNewVersion(i,t){return i.hash!==t.hash||i.buildTime!==t.buildTime?!0:i.version!==t.version}onUpdateAvailable(i){return this.listeners.push(i),()=>{const t=this.listeners.indexOf(i);t>-1&&this.listeners.splice(t,1)}}notifyListeners(i){this.listeners.forEach(t=>{try{t(i)}catch(r){console.error("Error in update listener:",r)}})}async reloadWithCacheClear(){try{await this.clearAllCaches(),await this.updateServiceWorker(),window.location.reload()}catch(i){console.error("Failed to clear caches:",i),window.location.reload()}}async updateServiceWorker(){if("serviceWorker"in navigator)try{const i=await navigator.serviceWorker.getRegistrations();for(const t of i)await t.update(),t.waiting&&t.waiting.postMessage({type:"SKIP_WAITING"})}catch(i){console.warn("Failed to update service worker:",i)}}async clearAllCaches(){const i=[];if("caches"in window&&i.push(caches.keys().then(t=>Promise.all(t.map(r=>(console.log(`Clearing cache: ${r}`),caches.delete(r)))))),"serviceWorker"in navigator&&navigator.serviceWorker.controller)try{navigator.serviceWorker.controller.postMessage({type:"CLEAR_CACHE"})}catch(t){console.warn("Failed to send clear cache message to service worker:",t)}try{localStorage.clear(),sessionStorage.clear()}catch(t){console.warn("Failed to clear storage:",t)}await Promise.all(i)}getCurrentVersion(){return this.currentVersion}isPWAMode(){return this.isPWA}destroy(){this.stopPeriodicCheck(),this.listeners=[]}}var Oo=Object.defineProperty,Do=Object.getOwnPropertyDescriptor,ki=(e,i,t,r)=>{for(var n=r>1?void 0:r?Do(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&Oo(i,t,n),n};let at=class extends ge{constructor(){super(...arguments),this.versionService=new fn,this.isChecking=!1}async connectedCallback(){super.connectedCallback(),await this.loadCurrentVersion()}async loadCurrentVersion(){try{await this.versionService.initialize();const e=this.versionService.getCurrentVersion();this.currentVersion=e?.version||"unknown",this.isPWA=this.versionService.isPWAMode()}catch(e){console.warn("Failed to load current version:",e)}}async handleCheckVersion(){this.isChecking=!0;try{const e=await this.versionService.checkForUpdates();this.lastCheckTime=new Date,e&&this.dispatchEvent(new CustomEvent("update-available",{bubbles:!0,composed:!0,detail:{hasUpdate:!0}}))}catch(e){console.error("Failed to check for updates:",e)}finally{this.isChecking=!1}}async handleForceReload(){try{await this.versionService.reloadWithCacheClear()}catch(e){console.error("Failed to reload:",e),window.location.reload()}}render(){const e=i=>i.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});return U`
      <div class="version-checker">
        <div class="version-info">
          v${this.currentVersion||"?"}${this.isPWA?" (PWA)":""}
        </div>
        
        <button 
          class="check-btn" 
          @click=${this.handleCheckVersion}
          ?disabled=${this.isChecking}
          title="Check for updates"
        >
          ${this.isChecking?"...":"↻"}
        </button>

        <button 
          class="check-btn" 
          @click=${this.handleForceReload}
          title="Force reload with cache clear"
        >
          ⟳
        </button>

        ${this.lastCheckTime?U`
          <div class="status">
            Last check: ${e(this.lastCheckTime)}
          </div>
        `:""}
      </div>
    `}};at.useShadowDom=!0;at.styles=qa`
    :host {
      display: inline-block;
    }

    .version-checker {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 12px;
      color: #64748b;
    }

    .check-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .check-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .check-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .version-info {
      font-family: monospace;
      font-size: 11px;
    }

    .status {
      font-weight: 500;
    }

    .status.checking {
      color: #f59e0b;
    }

    .status.up-to-date {
      color: #059669;
    }

    .status.update-available {
      color: #dc2626;
    }
  `;ki([$e()],at.prototype,"isChecking",2);ki([$e()],at.prototype,"lastCheckTime",2);ki([$e()],at.prototype,"currentVersion",2);ki([$e()],at.prototype,"isPWA",2);at=ki([we("version-checker")],at);var Io=Object.getOwnPropertyDescriptor,Mo=(e,i,t,r)=>{for(var n=r>1?void 0:r?Io(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let Dr=class{async convertFilesToBase64(e,i){const t=[];for(let r=0;r<e.length;r++){const n=e[r],a=n.type||"application/octet-stream",o=await this.fileToDataUrl(n),l=o.split(",")[1]||"";t.push({file:n,name:n.name,mimeType:a,dataUrl:o,originalSize:n.size,base64Size:l.length}),i&&i(Math.round((r+1)/e.length*100))}return t}fileToDataUrl(e){return new Promise((i,t)=>{const r=new FileReader;r.onload=()=>i(r.result),r.onerror=t,r.readAsDataURL(e)})}};Dr=Mo([vi(mt.Singleton)],Dr);var zo=Object.defineProperty,Lo=Object.getOwnPropertyDescriptor,es=(e,i,t,r)=>{for(var n=r>1?void 0:r?Lo(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&zo(i,t,n),n};let Ir=class extends ge{constructor(){super(...arguments),this.dragActive=!1,this.files=[],this.progress=0,this.results=[],this.processing=!1,this.copiedIndex=null,this._onDragOver=i=>{i.preventDefault(),this.dragActive=!0,this.requestUpdate()},this._onDragLeave=i=>{i.preventDefault(),this.dragActive=!1,this.requestUpdate()},this._onDrop=i=>{i.preventDefault(),this.dragActive=!1,i.dataTransfer?.files?.length&&this._handleFiles(i.dataTransfer.files)},this._onFileChange=i=>{const t=i.target;t.files?.length&&this._handleFiles(t.files)}}_downloadDataUrl(i,t,r){i.preventDefault();const n=window.open();n&&(n.document.write("<pre>"+this._escapeHtml(t)+"</pre>"),n.document.title=r+" (Base64)")}_escapeHtml(i){return i.replace(/[&<>"']/g,function(t){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[t]})}async _handleFiles(i){this.files=Array.from(i),this.progress=0,this.processing=!0,this.results=[],this.requestUpdate(),this.results=await this.base64Service.convertFilesToBase64(this.files,t=>{this.progress=t,this.requestUpdate()}),this.processing=!1,this.requestUpdate()}async _copyToClipboard(i,t){try{await navigator.clipboard.writeText(i),this.copiedIndex=t,this.requestUpdate(),setTimeout(()=>{this.copiedIndex=null,this.requestUpdate()},3e3)}catch{}}_selectDataUrl(i){const t=i.currentTarget;if(!t)return;const r=document.createRange();r.selectNodeContents(t);const n=window.getSelection();n?.removeAllRanges(),n?.addRange(r)}render(){return U`
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

      ${this.processing?U`
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
      ${this.results.length>0?U`
            <div class="file-list">
              ${this.results.map((i,t)=>U`
                  <div class="file-row">
                    <div class="file-name">
                      <span>${i.name}</span>
                      <div class="file-size">
                        ${(i.originalSize/1024).toFixed(2)} KB →
                        ${(i.base64Size/1024).toFixed(2)} KB
                      </div>
                    </div>
                    ${i.dataUrl.length>2048?U`<span class="data-url long-content"
                          >content too long to display
                          <a
                            href="#"
                            @click=${r=>this._downloadDataUrl(r,i.dataUrl,i.name)}
                            >Open in new tab</a
                          ></span
                        >`:U`<span
                          class="data-url"
                          tabindex="0"
                          @click=${r=>this._selectDataUrl(r)}
                          @focus=${r=>this._selectDataUrl(r)}
                          >${i.dataUrl}</span
                        >`}
                    <button
                      class="copy-btn${this.copiedIndex===t?" copied":""}"
                      @click=${()=>this._copyToClipboard(i.dataUrl,t)}
                    >
                      ${this.copiedIndex===t?"Copied":"Copy"}
                    </button>
                  </div>
                `)}
            </div>
          `:null}
    `}};es([Mt(Dr)],Ir.prototype,"base64Service",2);Ir=es([we("base64-page"),Ke("/base64",{title:"Base64 Converter",description:"A simple tool to convert text to Base64 and vice versa."})],Ir);var Bo=Object.getOwnPropertyDescriptor,Fo=(e,i,t,r)=>{for(var n=r>1?void 0:r?Bo(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let Vn=class extends ge{render(){return U`
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
    `}};Vn=Fo([we("compress-assets-page"),Ke("/compress-assets")],Vn);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const No={CHILD:2},Zo=e=>(...i)=>({_$litDirective$:e,values:i});class Ho{constructor(i){}get _$AU(){return this._$AM._$AU}_$AT(i,t,r){this._$Ct=i,this._$AM=t,this._$Ci=r}_$AS(i,t){return this.update(i,t)}update(i,t){return this.render(...t)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class Mr extends Ho{constructor(i){if(super(i),this.it=pe,i.type!==No.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(i){if(i===pe||i==null)return this._t=void 0,this.it=i;if(i===_t)return i;if(typeof i!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(i===this.it)return this._t;this.it=i;const t=[i];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Mr.directiveName="unsafeHTML",Mr.resultType=1;const jo=Zo(Mr);function pn(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var St=pn();function ts(e){St=e}var ni={exec:()=>null};function ae(e,i=""){let t=typeof e=="string"?e:e.source,r={replace:(n,a)=>{let o=typeof a=="string"?a:a.source;return o=o.replace(ke.caret,"$1"),t=t.replace(n,o),r},getRegex:()=>new RegExp(t,i)};return r}var ke={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}#`),htmlBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`,"i")},qo=/^(?:[ \t]*(?:\n|$))+/,Vo=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Go=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,xi=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Wo=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,gn=/(?:[*+-]|\d{1,9}[.)])/,is=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,rs=ae(is).replace(/bull/g,gn).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Yo=ae(is).replace(/bull/g,gn).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),bn=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Ko=/^[^\n]+/,mn=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Xo=ae(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",mn).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Jo=ae(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,gn).getRegex(),or="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",wn=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Qo=ae("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",wn).replace("tag",or).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),ns=ae(bn).replace("hr",xi).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",or).getRegex(),el=ae(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",ns).getRegex(),_n={blockquote:el,code:Vo,def:Xo,fences:Go,heading:Wo,hr:xi,html:Qo,lheading:rs,list:Jo,newline:qo,paragraph:ns,table:ni,text:Ko},Gn=ae("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",xi).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",or).getRegex(),tl={..._n,lheading:Yo,table:Gn,paragraph:ae(bn).replace("hr",xi).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Gn).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",or).getRegex()},il={..._n,html:ae(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",wn).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:ni,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:ae(bn).replace("hr",xi).replace("heading",` *#{1,6} *[^
]`).replace("lheading",rs).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},rl=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,nl=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,as=/^( {2,}|\\)\n(?!\s*$)/,al=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,lr=/[\p{P}\p{S}]/u,vn=/[\s\p{P}\p{S}]/u,ss=/[^\s\p{P}\p{S}]/u,sl=ae(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,vn).getRegex(),os=/(?!~)[\p{P}\p{S}]/u,ol=/(?!~)[\s\p{P}\p{S}]/u,ll=/(?:[^\s\p{P}\p{S}]|~)/u,cl=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,ls=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,dl=ae(ls,"u").replace(/punct/g,lr).getRegex(),hl=ae(ls,"u").replace(/punct/g,os).getRegex(),cs="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",ul=ae(cs,"gu").replace(/notPunctSpace/g,ss).replace(/punctSpace/g,vn).replace(/punct/g,lr).getRegex(),fl=ae(cs,"gu").replace(/notPunctSpace/g,ll).replace(/punctSpace/g,ol).replace(/punct/g,os).getRegex(),pl=ae("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,ss).replace(/punctSpace/g,vn).replace(/punct/g,lr).getRegex(),gl=ae(/\\(punct)/,"gu").replace(/punct/g,lr).getRegex(),bl=ae(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),ml=ae(wn).replace("(?:-->|$)","-->").getRegex(),wl=ae("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",ml).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Xi=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,_l=ae(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",Xi).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),ds=ae(/^!?\[(label)\]\[(ref)\]/).replace("label",Xi).replace("ref",mn).getRegex(),hs=ae(/^!?\[(ref)\](?:\[\])?/).replace("ref",mn).getRegex(),vl=ae("reflink|nolink(?!\\()","g").replace("reflink",ds).replace("nolink",hs).getRegex(),yn={_backpedal:ni,anyPunctuation:gl,autolink:bl,blockSkip:cl,br:as,code:nl,del:ni,emStrongLDelim:dl,emStrongRDelimAst:ul,emStrongRDelimUnd:pl,escape:rl,link:_l,nolink:hs,punctuation:sl,reflink:ds,reflinkSearch:vl,tag:wl,text:al,url:ni},yl={...yn,link:ae(/^!?\[(label)\]\((.*?)\)/).replace("label",Xi).getRegex(),reflink:ae(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Xi).getRegex()},zr={...yn,emStrongRDelimAst:fl,emStrongLDelim:hl,url:ae(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},kl={...zr,br:ae(as).replace("{2,}","*").getRegex(),text:ae(zr.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Bi={normal:_n,gfm:tl,pedantic:il},Jt={normal:yn,gfm:zr,breaks:kl,pedantic:yl},xl={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Wn=e=>xl[e];function Le(e,i){if(i){if(ke.escapeTest.test(e))return e.replace(ke.escapeReplace,Wn)}else if(ke.escapeTestNoEncode.test(e))return e.replace(ke.escapeReplaceNoEncode,Wn);return e}function Yn(e){try{e=encodeURI(e).replace(ke.percentDecode,"%")}catch{return null}return e}function Kn(e,i){let t=e.replace(ke.findPipe,(a,o,l)=>{let u=!1,c=o;for(;--c>=0&&l[c]==="\\";)u=!u;return u?"|":" |"}),r=t.split(ke.splitPipe),n=0;if(r[0].trim()||r.shift(),r.length>0&&!r.at(-1)?.trim()&&r.pop(),i)if(r.length>i)r.splice(i);else for(;r.length<i;)r.push("");for(;n<r.length;n++)r[n]=r[n].trim().replace(ke.slashPipe,"|");return r}function Qt(e,i,t){let r=e.length;if(r===0)return"";let n=0;for(;n<r&&e.charAt(r-n-1)===i;)n++;return e.slice(0,r-n)}function Sl(e,i){if(e.indexOf(i[1])===-1)return-1;let t=0;for(let r=0;r<e.length;r++)if(e[r]==="\\")r++;else if(e[r]===i[0])t++;else if(e[r]===i[1]&&(t--,t<0))return r;return t>0?-2:-1}function Xn(e,i,t,r,n){let a=i.href,o=i.title||null,l=e[1].replace(n.other.outputLinkReplace,"$1");r.state.inLink=!0;let u={type:e[0].charAt(0)==="!"?"image":"link",raw:t,href:a,title:o,text:l,tokens:r.inlineTokens(l)};return r.state.inLink=!1,u}function $l(e,i,t){let r=e.match(t.other.indentCodeCompensation);if(r===null)return i;let n=r[1];return i.split(`
`).map(a=>{let o=a.match(t.other.beginningSpace);if(o===null)return a;let[l]=o;return l.length>=n.length?a.slice(n.length):a}).join(`
`)}var Ji=class{options;rules;lexer;constructor(e){this.options=e||St}space(e){let i=this.rules.block.newline.exec(e);if(i&&i[0].length>0)return{type:"space",raw:i[0]}}code(e){let i=this.rules.block.code.exec(e);if(i){let t=i[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:i[0],codeBlockStyle:"indented",text:this.options.pedantic?t:Qt(t,`
`)}}}fences(e){let i=this.rules.block.fences.exec(e);if(i){let t=i[0],r=$l(t,i[3]||"",this.rules);return{type:"code",raw:t,lang:i[2]?i[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):i[2],text:r}}}heading(e){let i=this.rules.block.heading.exec(e);if(i){let t=i[2].trim();if(this.rules.other.endingHash.test(t)){let r=Qt(t,"#");(this.options.pedantic||!r||this.rules.other.endingSpaceChar.test(r))&&(t=r.trim())}return{type:"heading",raw:i[0],depth:i[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(e){let i=this.rules.block.hr.exec(e);if(i)return{type:"hr",raw:Qt(i[0],`
`)}}blockquote(e){let i=this.rules.block.blockquote.exec(e);if(i){let t=Qt(i[0],`
`).split(`
`),r="",n="",a=[];for(;t.length>0;){let o=!1,l=[],u;for(u=0;u<t.length;u++)if(this.rules.other.blockquoteStart.test(t[u]))l.push(t[u]),o=!0;else if(!o)l.push(t[u]);else break;t=t.slice(u);let c=l.join(`
`),h=c.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");r=r?`${r}
${c}`:c,n=n?`${n}
${h}`:h;let x=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(h,a,!0),this.lexer.state.top=x,t.length===0)break;let y=a.at(-1);if(y?.type==="code")break;if(y?.type==="blockquote"){let v=y,E=v.raw+`
`+t.join(`
`),H=this.blockquote(E);a[a.length-1]=H,r=r.substring(0,r.length-v.raw.length)+H.raw,n=n.substring(0,n.length-v.text.length)+H.text;break}else if(y?.type==="list"){let v=y,E=v.raw+`
`+t.join(`
`),H=this.list(E);a[a.length-1]=H,r=r.substring(0,r.length-y.raw.length)+H.raw,n=n.substring(0,n.length-v.raw.length)+H.raw,t=E.substring(a.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:r,tokens:a,text:n}}}list(e){let i=this.rules.block.list.exec(e);if(i){let t=i[1].trim(),r=t.length>1,n={type:"list",raw:"",ordered:r,start:r?+t.slice(0,-1):"",loose:!1,items:[]};t=r?`\\d{1,9}\\${t.slice(-1)}`:`\\${t}`,this.options.pedantic&&(t=r?t:"[*+-]");let a=this.rules.other.listItemRegex(t),o=!1;for(;e;){let u=!1,c="",h="";if(!(i=a.exec(e))||this.rules.block.hr.test(e))break;c=i[0],e=e.substring(c.length);let x=i[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,O=>" ".repeat(3*O.length)),y=e.split(`
`,1)[0],v=!x.trim(),E=0;if(this.options.pedantic?(E=2,h=x.trimStart()):v?E=i[1].length+1:(E=i[2].search(this.rules.other.nonSpaceChar),E=E>4?1:E,h=x.slice(E),E+=i[1].length),v&&this.rules.other.blankLine.test(y)&&(c+=y+`
`,e=e.substring(y.length+1),u=!0),!u){let O=this.rules.other.nextBulletRegex(E),q=this.rules.other.hrRegex(E),I=this.rules.other.fencesBeginRegex(E),P=this.rules.other.headingBeginRegex(E),X=this.rules.other.htmlBeginRegex(E);for(;e;){let ce=e.split(`
`,1)[0],D;if(y=ce,this.options.pedantic?(y=y.replace(this.rules.other.listReplaceNesting,"  "),D=y):D=y.replace(this.rules.other.tabCharGlobal,"    "),I.test(y)||P.test(y)||X.test(y)||O.test(y)||q.test(y))break;if(D.search(this.rules.other.nonSpaceChar)>=E||!y.trim())h+=`
`+D.slice(E);else{if(v||x.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||I.test(x)||P.test(x)||q.test(x))break;h+=`
`+y}!v&&!y.trim()&&(v=!0),c+=ce+`
`,e=e.substring(ce.length+1),x=D.slice(E)}}n.loose||(o?n.loose=!0:this.rules.other.doubleBlankLine.test(c)&&(o=!0));let H=null,M;this.options.gfm&&(H=this.rules.other.listIsTask.exec(h),H&&(M=H[0]!=="[ ] ",h=h.replace(this.rules.other.listReplaceTask,""))),n.items.push({type:"list_item",raw:c,task:!!H,checked:M,loose:!1,text:h,tokens:[]}),n.raw+=c}let l=n.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;n.raw=n.raw.trimEnd();for(let u=0;u<n.items.length;u++)if(this.lexer.state.top=!1,n.items[u].tokens=this.lexer.blockTokens(n.items[u].text,[]),!n.loose){let c=n.items[u].tokens.filter(x=>x.type==="space"),h=c.length>0&&c.some(x=>this.rules.other.anyLine.test(x.raw));n.loose=h}if(n.loose)for(let u=0;u<n.items.length;u++)n.items[u].loose=!0;return n}}html(e){let i=this.rules.block.html.exec(e);if(i)return{type:"html",block:!0,raw:i[0],pre:i[1]==="pre"||i[1]==="script"||i[1]==="style",text:i[0]}}def(e){let i=this.rules.block.def.exec(e);if(i){let t=i[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),r=i[2]?i[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",n=i[3]?i[3].substring(1,i[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):i[3];return{type:"def",tag:t,raw:i[0],href:r,title:n}}}table(e){let i=this.rules.block.table.exec(e);if(!i||!this.rules.other.tableDelimiter.test(i[2]))return;let t=Kn(i[1]),r=i[2].replace(this.rules.other.tableAlignChars,"").split("|"),n=i[3]?.trim()?i[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],a={type:"table",raw:i[0],header:[],align:[],rows:[]};if(t.length===r.length){for(let o of r)this.rules.other.tableAlignRight.test(o)?a.align.push("right"):this.rules.other.tableAlignCenter.test(o)?a.align.push("center"):this.rules.other.tableAlignLeft.test(o)?a.align.push("left"):a.align.push(null);for(let o=0;o<t.length;o++)a.header.push({text:t[o],tokens:this.lexer.inline(t[o]),header:!0,align:a.align[o]});for(let o of n)a.rows.push(Kn(o,a.header.length).map((l,u)=>({text:l,tokens:this.lexer.inline(l),header:!1,align:a.align[u]})));return a}}lheading(e){let i=this.rules.block.lheading.exec(e);if(i)return{type:"heading",raw:i[0],depth:i[2].charAt(0)==="="?1:2,text:i[1],tokens:this.lexer.inline(i[1])}}paragraph(e){let i=this.rules.block.paragraph.exec(e);if(i){let t=i[1].charAt(i[1].length-1)===`
`?i[1].slice(0,-1):i[1];return{type:"paragraph",raw:i[0],text:t,tokens:this.lexer.inline(t)}}}text(e){let i=this.rules.block.text.exec(e);if(i)return{type:"text",raw:i[0],text:i[0],tokens:this.lexer.inline(i[0])}}escape(e){let i=this.rules.inline.escape.exec(e);if(i)return{type:"escape",raw:i[0],text:i[1]}}tag(e){let i=this.rules.inline.tag.exec(e);if(i)return!this.lexer.state.inLink&&this.rules.other.startATag.test(i[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(i[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(i[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(i[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:i[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:i[0]}}link(e){let i=this.rules.inline.link.exec(e);if(i){let t=i[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(t)){if(!this.rules.other.endAngleBracket.test(t))return;let a=Qt(t.slice(0,-1),"\\");if((t.length-a.length)%2===0)return}else{let a=Sl(i[2],"()");if(a===-2)return;if(a>-1){let o=(i[0].indexOf("!")===0?5:4)+i[1].length+a;i[2]=i[2].substring(0,a),i[0]=i[0].substring(0,o).trim(),i[3]=""}}let r=i[2],n="";if(this.options.pedantic){let a=this.rules.other.pedanticHrefTitle.exec(r);a&&(r=a[1],n=a[3])}else n=i[3]?i[3].slice(1,-1):"";return r=r.trim(),this.rules.other.startAngleBracket.test(r)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(t)?r=r.slice(1):r=r.slice(1,-1)),Xn(i,{href:r&&r.replace(this.rules.inline.anyPunctuation,"$1"),title:n&&n.replace(this.rules.inline.anyPunctuation,"$1")},i[0],this.lexer,this.rules)}}reflink(e,i){let t;if((t=this.rules.inline.reflink.exec(e))||(t=this.rules.inline.nolink.exec(e))){let r=(t[2]||t[1]).replace(this.rules.other.multipleSpaceGlobal," "),n=i[r.toLowerCase()];if(!n){let a=t[0].charAt(0);return{type:"text",raw:a,text:a}}return Xn(t,n,t[0],this.lexer,this.rules)}}emStrong(e,i,t=""){let r=this.rules.inline.emStrongLDelim.exec(e);if(!(!r||r[3]&&t.match(this.rules.other.unicodeAlphaNumeric))&&(!(r[1]||r[2])||!t||this.rules.inline.punctuation.exec(t))){let n=[...r[0]].length-1,a,o,l=n,u=0,c=r[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(c.lastIndex=0,i=i.slice(-1*e.length+n);(r=c.exec(i))!=null;){if(a=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!a)continue;if(o=[...a].length,r[3]||r[4]){l+=o;continue}else if((r[5]||r[6])&&n%3&&!((n+o)%3)){u+=o;continue}if(l-=o,l>0)continue;o=Math.min(o,o+l+u);let h=[...r[0]][0].length,x=e.slice(0,n+r.index+h+o);if(Math.min(n,o)%2){let v=x.slice(1,-1);return{type:"em",raw:x,text:v,tokens:this.lexer.inlineTokens(v)}}let y=x.slice(2,-2);return{type:"strong",raw:x,text:y,tokens:this.lexer.inlineTokens(y)}}}}codespan(e){let i=this.rules.inline.code.exec(e);if(i){let t=i[2].replace(this.rules.other.newLineCharGlobal," "),r=this.rules.other.nonSpaceChar.test(t),n=this.rules.other.startingSpaceChar.test(t)&&this.rules.other.endingSpaceChar.test(t);return r&&n&&(t=t.substring(1,t.length-1)),{type:"codespan",raw:i[0],text:t}}}br(e){let i=this.rules.inline.br.exec(e);if(i)return{type:"br",raw:i[0]}}del(e){let i=this.rules.inline.del.exec(e);if(i)return{type:"del",raw:i[0],text:i[2],tokens:this.lexer.inlineTokens(i[2])}}autolink(e){let i=this.rules.inline.autolink.exec(e);if(i){let t,r;return i[2]==="@"?(t=i[1],r="mailto:"+t):(t=i[1],r=t),{type:"link",raw:i[0],text:t,href:r,tokens:[{type:"text",raw:t,text:t}]}}}url(e){let i;if(i=this.rules.inline.url.exec(e)){let t,r;if(i[2]==="@")t=i[0],r="mailto:"+t;else{let n;do n=i[0],i[0]=this.rules.inline._backpedal.exec(i[0])?.[0]??"";while(n!==i[0]);t=i[0],i[1]==="www."?r="http://"+i[0]:r=i[0]}return{type:"link",raw:i[0],text:t,href:r,tokens:[{type:"text",raw:t,text:t}]}}}inlineText(e){let i=this.rules.inline.text.exec(e);if(i){let t=this.lexer.state.inRawBlock;return{type:"text",raw:i[0],text:i[0],escaped:t}}}},Ge=class Lr{tokens;options;state;tokenizer;inlineQueue;constructor(i){this.tokens=[],this.tokens.links=Object.create(null),this.options=i||St,this.options.tokenizer=this.options.tokenizer||new Ji,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:ke,block:Bi.normal,inline:Jt.normal};this.options.pedantic?(t.block=Bi.pedantic,t.inline=Jt.pedantic):this.options.gfm&&(t.block=Bi.gfm,this.options.breaks?t.inline=Jt.breaks:t.inline=Jt.gfm),this.tokenizer.rules=t}static get rules(){return{block:Bi,inline:Jt}}static lex(i,t){return new Lr(t).lex(i)}static lexInline(i,t){return new Lr(t).inlineTokens(i)}lex(i){i=i.replace(ke.carriageReturn,`
`),this.blockTokens(i,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let r=this.inlineQueue[t];this.inlineTokens(r.src,r.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(i,t=[],r=!1){for(this.options.pedantic&&(i=i.replace(ke.tabCharGlobal,"    ").replace(ke.spaceLine,""));i;){let n;if(this.options.extensions?.block?.some(o=>(n=o.call({lexer:this},i,t))?(i=i.substring(n.raw.length),t.push(n),!0):!1))continue;if(n=this.tokenizer.space(i)){i=i.substring(n.raw.length);let o=t.at(-1);n.raw.length===1&&o!==void 0?o.raw+=`
`:t.push(n);continue}if(n=this.tokenizer.code(i)){i=i.substring(n.raw.length);let o=t.at(-1);o?.type==="paragraph"||o?.type==="text"?(o.raw+=`
`+n.raw,o.text+=`
`+n.text,this.inlineQueue.at(-1).src=o.text):t.push(n);continue}if(n=this.tokenizer.fences(i)){i=i.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.heading(i)){i=i.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.hr(i)){i=i.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.blockquote(i)){i=i.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.list(i)){i=i.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.html(i)){i=i.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.def(i)){i=i.substring(n.raw.length);let o=t.at(-1);o?.type==="paragraph"||o?.type==="text"?(o.raw+=`
`+n.raw,o.text+=`
`+n.raw,this.inlineQueue.at(-1).src=o.text):this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title});continue}if(n=this.tokenizer.table(i)){i=i.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.lheading(i)){i=i.substring(n.raw.length),t.push(n);continue}let a=i;if(this.options.extensions?.startBlock){let o=1/0,l=i.slice(1),u;this.options.extensions.startBlock.forEach(c=>{u=c.call({lexer:this},l),typeof u=="number"&&u>=0&&(o=Math.min(o,u))}),o<1/0&&o>=0&&(a=i.substring(0,o+1))}if(this.state.top&&(n=this.tokenizer.paragraph(a))){let o=t.at(-1);r&&o?.type==="paragraph"?(o.raw+=`
`+n.raw,o.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):t.push(n),r=a.length!==i.length,i=i.substring(n.raw.length);continue}if(n=this.tokenizer.text(i)){i=i.substring(n.raw.length);let o=t.at(-1);o?.type==="text"?(o.raw+=`
`+n.raw,o.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):t.push(n);continue}if(i){let o="Infinite loop on byte: "+i.charCodeAt(0);if(this.options.silent){console.error(o);break}else throw new Error(o)}}return this.state.top=!0,t}inline(i,t=[]){return this.inlineQueue.push({src:i,tokens:t}),t}inlineTokens(i,t=[]){let r=i,n=null;if(this.tokens.links){let l=Object.keys(this.tokens.links);if(l.length>0)for(;(n=this.tokenizer.rules.inline.reflinkSearch.exec(r))!=null;)l.includes(n[0].slice(n[0].lastIndexOf("[")+1,-1))&&(r=r.slice(0,n.index)+"["+"a".repeat(n[0].length-2)+"]"+r.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(n=this.tokenizer.rules.inline.anyPunctuation.exec(r))!=null;)r=r.slice(0,n.index)+"++"+r.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(n=this.tokenizer.rules.inline.blockSkip.exec(r))!=null;)r=r.slice(0,n.index)+"["+"a".repeat(n[0].length-2)+"]"+r.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let a=!1,o="";for(;i;){a||(o=""),a=!1;let l;if(this.options.extensions?.inline?.some(c=>(l=c.call({lexer:this},i,t))?(i=i.substring(l.raw.length),t.push(l),!0):!1))continue;if(l=this.tokenizer.escape(i)){i=i.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.tag(i)){i=i.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.link(i)){i=i.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.reflink(i,this.tokens.links)){i=i.substring(l.raw.length);let c=t.at(-1);l.type==="text"&&c?.type==="text"?(c.raw+=l.raw,c.text+=l.text):t.push(l);continue}if(l=this.tokenizer.emStrong(i,r,o)){i=i.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.codespan(i)){i=i.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.br(i)){i=i.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.del(i)){i=i.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.autolink(i)){i=i.substring(l.raw.length),t.push(l);continue}if(!this.state.inLink&&(l=this.tokenizer.url(i))){i=i.substring(l.raw.length),t.push(l);continue}let u=i;if(this.options.extensions?.startInline){let c=1/0,h=i.slice(1),x;this.options.extensions.startInline.forEach(y=>{x=y.call({lexer:this},h),typeof x=="number"&&x>=0&&(c=Math.min(c,x))}),c<1/0&&c>=0&&(u=i.substring(0,c+1))}if(l=this.tokenizer.inlineText(u)){i=i.substring(l.raw.length),l.raw.slice(-1)!=="_"&&(o=l.raw.slice(-1)),a=!0;let c=t.at(-1);c?.type==="text"?(c.raw+=l.raw,c.text+=l.text):t.push(l);continue}if(i){let c="Infinite loop on byte: "+i.charCodeAt(0);if(this.options.silent){console.error(c);break}else throw new Error(c)}}return t}},Qi=class{options;parser;constructor(e){this.options=e||St}space(e){return""}code({text:e,lang:i,escaped:t}){let r=(i||"").match(ke.notSpaceStart)?.[0],n=e.replace(ke.endingNewline,"")+`
`;return r?'<pre><code class="language-'+Le(r)+'">'+(t?n:Le(n,!0))+`</code></pre>
`:"<pre><code>"+(t?n:Le(n,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:i}){return`<h${i}>${this.parser.parseInline(e)}</h${i}>
`}hr(e){return`<hr>
`}list(e){let i=e.ordered,t=e.start,r="";for(let o=0;o<e.items.length;o++){let l=e.items[o];r+=this.listitem(l)}let n=i?"ol":"ul",a=i&&t!==1?' start="'+t+'"':"";return"<"+n+a+`>
`+r+"</"+n+`>
`}listitem(e){let i="";if(e.task){let t=this.checkbox({checked:!!e.checked});e.loose?e.tokens[0]?.type==="paragraph"?(e.tokens[0].text=t+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=t+" "+Le(e.tokens[0].tokens[0].text),e.tokens[0].tokens[0].escaped=!0)):e.tokens.unshift({type:"text",raw:t+" ",text:t+" ",escaped:!0}):i+=t+" "}return i+=this.parser.parse(e.tokens,!!e.loose),`<li>${i}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let i="",t="";for(let n=0;n<e.header.length;n++)t+=this.tablecell(e.header[n]);i+=this.tablerow({text:t});let r="";for(let n=0;n<e.rows.length;n++){let a=e.rows[n];t="";for(let o=0;o<a.length;o++)t+=this.tablecell(a[o]);r+=this.tablerow({text:t})}return r&&(r=`<tbody>${r}</tbody>`),`<table>
<thead>
`+i+`</thead>
`+r+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let i=this.parser.parseInline(e.tokens),t=e.header?"th":"td";return(e.align?`<${t} align="${e.align}">`:`<${t}>`)+i+`</${t}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${Le(e,!0)}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:i,tokens:t}){let r=this.parser.parseInline(t),n=Yn(e);if(n===null)return r;e=n;let a='<a href="'+e+'"';return i&&(a+=' title="'+Le(i)+'"'),a+=">"+r+"</a>",a}image({href:e,title:i,text:t,tokens:r}){r&&(t=this.parser.parseInline(r,this.parser.textRenderer));let n=Yn(e);if(n===null)return Le(t);e=n;let a=`<img src="${e}" alt="${t}"`;return i&&(a+=` title="${Le(i)}"`),a+=">",a}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):"escaped"in e&&e.escaped?e.text:Le(e.text)}},kn=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}},We=class Br{options;renderer;textRenderer;constructor(i){this.options=i||St,this.options.renderer=this.options.renderer||new Qi,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new kn}static parse(i,t){return new Br(t).parse(i)}static parseInline(i,t){return new Br(t).parseInline(i)}parse(i,t=!0){let r="";for(let n=0;n<i.length;n++){let a=i[n];if(this.options.extensions?.renderers?.[a.type]){let l=a,u=this.options.extensions.renderers[l.type].call({parser:this},l);if(u!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(l.type)){r+=u||"";continue}}let o=a;switch(o.type){case"space":{r+=this.renderer.space(o);continue}case"hr":{r+=this.renderer.hr(o);continue}case"heading":{r+=this.renderer.heading(o);continue}case"code":{r+=this.renderer.code(o);continue}case"table":{r+=this.renderer.table(o);continue}case"blockquote":{r+=this.renderer.blockquote(o);continue}case"list":{r+=this.renderer.list(o);continue}case"html":{r+=this.renderer.html(o);continue}case"paragraph":{r+=this.renderer.paragraph(o);continue}case"text":{let l=o,u=this.renderer.text(l);for(;n+1<i.length&&i[n+1].type==="text";)l=i[++n],u+=`
`+this.renderer.text(l);t?r+=this.renderer.paragraph({type:"paragraph",raw:u,text:u,tokens:[{type:"text",raw:u,text:u,escaped:!0}]}):r+=u;continue}default:{let l='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return r}parseInline(i,t=this.renderer){let r="";for(let n=0;n<i.length;n++){let a=i[n];if(this.options.extensions?.renderers?.[a.type]){let l=this.options.extensions.renderers[a.type].call({parser:this},a);if(l!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(a.type)){r+=l||"";continue}}let o=a;switch(o.type){case"escape":{r+=t.text(o);break}case"html":{r+=t.html(o);break}case"link":{r+=t.link(o);break}case"image":{r+=t.image(o);break}case"strong":{r+=t.strong(o);break}case"em":{r+=t.em(o);break}case"codespan":{r+=t.codespan(o);break}case"br":{r+=t.br(o);break}case"del":{r+=t.del(o);break}case"text":{r+=t.text(o);break}default:{let l='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return r}},Vi=class{options;block;constructor(e){this.options=e||St}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}provideLexer(){return this.block?Ge.lex:Ge.lexInline}provideParser(){return this.block?We.parse:We.parseInline}},Al=class{defaults=pn();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=We;Renderer=Qi;TextRenderer=kn;Lexer=Ge;Tokenizer=Ji;Hooks=Vi;constructor(...e){this.use(...e)}walkTokens(e,i){let t=[];for(let r of e)switch(t=t.concat(i.call(this,r)),r.type){case"table":{let n=r;for(let a of n.header)t=t.concat(this.walkTokens(a.tokens,i));for(let a of n.rows)for(let o of a)t=t.concat(this.walkTokens(o.tokens,i));break}case"list":{let n=r;t=t.concat(this.walkTokens(n.items,i));break}default:{let n=r;this.defaults.extensions?.childTokens?.[n.type]?this.defaults.extensions.childTokens[n.type].forEach(a=>{let o=n[a].flat(1/0);t=t.concat(this.walkTokens(o,i))}):n.tokens&&(t=t.concat(this.walkTokens(n.tokens,i)))}}return t}use(...e){let i=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(t=>{let r={...t};if(r.async=this.defaults.async||r.async||!1,t.extensions&&(t.extensions.forEach(n=>{if(!n.name)throw new Error("extension name required");if("renderer"in n){let a=i.renderers[n.name];a?i.renderers[n.name]=function(...o){let l=n.renderer.apply(this,o);return l===!1&&(l=a.apply(this,o)),l}:i.renderers[n.name]=n.renderer}if("tokenizer"in n){if(!n.level||n.level!=="block"&&n.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let a=i[n.level];a?a.unshift(n.tokenizer):i[n.level]=[n.tokenizer],n.start&&(n.level==="block"?i.startBlock?i.startBlock.push(n.start):i.startBlock=[n.start]:n.level==="inline"&&(i.startInline?i.startInline.push(n.start):i.startInline=[n.start]))}"childTokens"in n&&n.childTokens&&(i.childTokens[n.name]=n.childTokens)}),r.extensions=i),t.renderer){let n=this.defaults.renderer||new Qi(this.defaults);for(let a in t.renderer){if(!(a in n))throw new Error(`renderer '${a}' does not exist`);if(["options","parser"].includes(a))continue;let o=a,l=t.renderer[o],u=n[o];n[o]=(...c)=>{let h=l.apply(n,c);return h===!1&&(h=u.apply(n,c)),h||""}}r.renderer=n}if(t.tokenizer){let n=this.defaults.tokenizer||new Ji(this.defaults);for(let a in t.tokenizer){if(!(a in n))throw new Error(`tokenizer '${a}' does not exist`);if(["options","rules","lexer"].includes(a))continue;let o=a,l=t.tokenizer[o],u=n[o];n[o]=(...c)=>{let h=l.apply(n,c);return h===!1&&(h=u.apply(n,c)),h}}r.tokenizer=n}if(t.hooks){let n=this.defaults.hooks||new Vi;for(let a in t.hooks){if(!(a in n))throw new Error(`hook '${a}' does not exist`);if(["options","block"].includes(a))continue;let o=a,l=t.hooks[o],u=n[o];Vi.passThroughHooks.has(a)?n[o]=c=>{if(this.defaults.async)return Promise.resolve(l.call(n,c)).then(x=>u.call(n,x));let h=l.call(n,c);return u.call(n,h)}:n[o]=(...c)=>{let h=l.apply(n,c);return h===!1&&(h=u.apply(n,c)),h}}r.hooks=n}if(t.walkTokens){let n=this.defaults.walkTokens,a=t.walkTokens;r.walkTokens=function(o){let l=[];return l.push(a.call(this,o)),n&&(l=l.concat(n.call(this,o))),l}}this.defaults={...this.defaults,...r}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,i){return Ge.lex(e,i??this.defaults)}parser(e,i){return We.parse(e,i??this.defaults)}parseMarkdown(e){return(i,t)=>{let r={...t},n={...this.defaults,...r},a=this.onError(!!n.silent,!!n.async);if(this.defaults.async===!0&&r.async===!1)return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof i>"u"||i===null)return a(new Error("marked(): input parameter is undefined or null"));if(typeof i!="string")return a(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(i)+", string expected"));n.hooks&&(n.hooks.options=n,n.hooks.block=e);let o=n.hooks?n.hooks.provideLexer():e?Ge.lex:Ge.lexInline,l=n.hooks?n.hooks.provideParser():e?We.parse:We.parseInline;if(n.async)return Promise.resolve(n.hooks?n.hooks.preprocess(i):i).then(u=>o(u,n)).then(u=>n.hooks?n.hooks.processAllTokens(u):u).then(u=>n.walkTokens?Promise.all(this.walkTokens(u,n.walkTokens)).then(()=>u):u).then(u=>l(u,n)).then(u=>n.hooks?n.hooks.postprocess(u):u).catch(a);try{n.hooks&&(i=n.hooks.preprocess(i));let u=o(i,n);n.hooks&&(u=n.hooks.processAllTokens(u)),n.walkTokens&&this.walkTokens(u,n.walkTokens);let c=l(u,n);return n.hooks&&(c=n.hooks.postprocess(c)),c}catch(u){return a(u)}}}onError(e,i){return t=>{if(t.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let r="<p>An error occurred:</p><pre>"+Le(t.message+"",!0)+"</pre>";return i?Promise.resolve(r):r}if(i)return Promise.reject(t);throw t}}},vt=new Al;function oe(e,i){return vt.parse(e,i)}oe.options=oe.setOptions=function(e){return vt.setOptions(e),oe.defaults=vt.defaults,ts(oe.defaults),oe};oe.getDefaults=pn;oe.defaults=St;oe.use=function(...e){return vt.use(...e),oe.defaults=vt.defaults,ts(oe.defaults),oe};oe.walkTokens=function(e,i){return vt.walkTokens(e,i)};oe.parseInline=vt.parseInline;oe.Parser=We;oe.parser=We.parse;oe.Renderer=Qi;oe.TextRenderer=kn;oe.Lexer=Ge;oe.lexer=Ge.lex;oe.Tokenizer=Ji;oe.Hooks=Vi;oe.parse=oe;oe.options;oe.setOptions;oe.use;oe.walkTokens;oe.parseInline;We.parse;Ge.lex;const El=`# Unifying Playable Ads: The CTA SDK Bridge

> **Note:** The CTA SDK is used by the [Publish Tool](/#publish), enabling seamless deployment and integration of HTML5 playables across multiple ad networks.

## 1. Game Events and CTA Calls

When the playable is finished, the user should click the Call to Action button (such as Install, Play, Next, etc.). When that button is clicked, you should call the following code:

  \`\`\`typescript
  document["CTA"]?.onClick?.(); // Triggers the app store
  \`\`\`

This method acts as a proxy for the specific APIs required by different ad platforms. It will only call the necessary API to direct the user to the app store.

### Optional methods

  \`\`\`typescript
  document["CTA"]?.gameEnd?.(); // Signals the end of gameplay

  document["CTA"]?.gameReady?.(); // Signals the ad is loaded and interactive
  \`\`\`

`;var Cl=Object.getOwnPropertyDescriptor,Pl=(e,i,t,r)=>{for(var n=r>1?void 0:r?Cl(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let Jn=class extends ge{constructor(){super(...arguments),this.markdownHtml=""}connectedCallback(){super.connectedCallback();const e=oe.parse(El);typeof e=="string"&&(this.markdownHtml=e),this.requestUpdate()}render(){return U`
      <div class="cta-sdk-info">
        <div>${jo(this.markdownHtml)}</div>
      </div>
    `}};Jn=Pl([we("cta-sdk-page"),Ke("/cta-sdk",{title:"CTA SDK Documentation",description:"Documentation for the CTA SDK, providing guidance on how to integrate and use the SDK in your playable ads."})],Jn);var Tl=Object.getOwnPropertyDescriptor,Rl=(e,i,t,r)=>{for(var n=r>1?void 0:r?Tl(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let Qn=class extends ge{render(){return U`
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
    `}};Qn=Rl([we("home-page"),Ke("/",{title:"Playable Tools for HTML5 Ads",description:"A collection of open-source tools for HTML5 playable ads developers, including publishing, asset compression, and validation."})],Qn);/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */const Ul=4,ea=0,ta=1,Ol=2;function zt(e){let i=e.length;for(;--i>=0;)e[i]=0}const Dl=0,us=1,Il=2,Ml=3,zl=258,xn=29,Si=256,hi=Si+1+xn,Rt=30,Sn=19,fs=2*hi+1,pt=15,_r=16,Ll=7,$n=256,ps=16,gs=17,bs=18,Fr=new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]),Gi=new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),Bl=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]),ms=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Fl=512,qe=new Array((hi+2)*2);zt(qe);const ai=new Array(Rt*2);zt(ai);const ui=new Array(Fl);zt(ui);const fi=new Array(zl-Ml+1);zt(fi);const An=new Array(xn);zt(An);const er=new Array(Rt);zt(er);function vr(e,i,t,r,n){this.static_tree=e,this.extra_bits=i,this.extra_base=t,this.elems=r,this.max_length=n,this.has_stree=e&&e.length}let ws,_s,vs;function yr(e,i){this.dyn_tree=e,this.max_code=0,this.stat_desc=i}const ys=e=>e<256?ui[e]:ui[256+(e>>>7)],pi=(e,i)=>{e.pending_buf[e.pending++]=i&255,e.pending_buf[e.pending++]=i>>>8&255},Se=(e,i,t)=>{e.bi_valid>_r-t?(e.bi_buf|=i<<e.bi_valid&65535,pi(e,e.bi_buf),e.bi_buf=i>>_r-e.bi_valid,e.bi_valid+=t-_r):(e.bi_buf|=i<<e.bi_valid&65535,e.bi_valid+=t)},Be=(e,i,t)=>{Se(e,t[i*2],t[i*2+1])},ks=(e,i)=>{let t=0;do t|=e&1,e>>>=1,t<<=1;while(--i>0);return t>>>1},Nl=e=>{e.bi_valid===16?(pi(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=e.bi_buf&255,e.bi_buf>>=8,e.bi_valid-=8)},Zl=(e,i)=>{const t=i.dyn_tree,r=i.max_code,n=i.stat_desc.static_tree,a=i.stat_desc.has_stree,o=i.stat_desc.extra_bits,l=i.stat_desc.extra_base,u=i.stat_desc.max_length;let c,h,x,y,v,E,H=0;for(y=0;y<=pt;y++)e.bl_count[y]=0;for(t[e.heap[e.heap_max]*2+1]=0,c=e.heap_max+1;c<fs;c++)h=e.heap[c],y=t[t[h*2+1]*2+1]+1,y>u&&(y=u,H++),t[h*2+1]=y,!(h>r)&&(e.bl_count[y]++,v=0,h>=l&&(v=o[h-l]),E=t[h*2],e.opt_len+=E*(y+v),a&&(e.static_len+=E*(n[h*2+1]+v)));if(H!==0){do{for(y=u-1;e.bl_count[y]===0;)y--;e.bl_count[y]--,e.bl_count[y+1]+=2,e.bl_count[u]--,H-=2}while(H>0);for(y=u;y!==0;y--)for(h=e.bl_count[y];h!==0;)x=e.heap[--c],!(x>r)&&(t[x*2+1]!==y&&(e.opt_len+=(y-t[x*2+1])*t[x*2],t[x*2+1]=y),h--)}},xs=(e,i,t)=>{const r=new Array(pt+1);let n=0,a,o;for(a=1;a<=pt;a++)n=n+t[a-1]<<1,r[a]=n;for(o=0;o<=i;o++){let l=e[o*2+1];l!==0&&(e[o*2]=ks(r[l]++,l))}},Hl=()=>{let e,i,t,r,n;const a=new Array(pt+1);for(t=0,r=0;r<xn-1;r++)for(An[r]=t,e=0;e<1<<Fr[r];e++)fi[t++]=r;for(fi[t-1]=r,n=0,r=0;r<16;r++)for(er[r]=n,e=0;e<1<<Gi[r];e++)ui[n++]=r;for(n>>=7;r<Rt;r++)for(er[r]=n<<7,e=0;e<1<<Gi[r]-7;e++)ui[256+n++]=r;for(i=0;i<=pt;i++)a[i]=0;for(e=0;e<=143;)qe[e*2+1]=8,e++,a[8]++;for(;e<=255;)qe[e*2+1]=9,e++,a[9]++;for(;e<=279;)qe[e*2+1]=7,e++,a[7]++;for(;e<=287;)qe[e*2+1]=8,e++,a[8]++;for(xs(qe,hi+1,a),e=0;e<Rt;e++)ai[e*2+1]=5,ai[e*2]=ks(e,5);ws=new vr(qe,Fr,Si+1,hi,pt),_s=new vr(ai,Gi,0,Rt,pt),vs=new vr(new Array(0),Bl,0,Sn,Ll)},Ss=e=>{let i;for(i=0;i<hi;i++)e.dyn_ltree[i*2]=0;for(i=0;i<Rt;i++)e.dyn_dtree[i*2]=0;for(i=0;i<Sn;i++)e.bl_tree[i*2]=0;e.dyn_ltree[$n*2]=1,e.opt_len=e.static_len=0,e.sym_next=e.matches=0},$s=e=>{e.bi_valid>8?pi(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0},ia=(e,i,t,r)=>{const n=i*2,a=t*2;return e[n]<e[a]||e[n]===e[a]&&r[i]<=r[t]},kr=(e,i,t)=>{const r=e.heap[t];let n=t<<1;for(;n<=e.heap_len&&(n<e.heap_len&&ia(i,e.heap[n+1],e.heap[n],e.depth)&&n++,!ia(i,r,e.heap[n],e.depth));)e.heap[t]=e.heap[n],t=n,n<<=1;e.heap[t]=r},ra=(e,i,t)=>{let r,n,a=0,o,l;if(e.sym_next!==0)do r=e.pending_buf[e.sym_buf+a++]&255,r+=(e.pending_buf[e.sym_buf+a++]&255)<<8,n=e.pending_buf[e.sym_buf+a++],r===0?Be(e,n,i):(o=fi[n],Be(e,o+Si+1,i),l=Fr[o],l!==0&&(n-=An[o],Se(e,n,l)),r--,o=ys(r),Be(e,o,t),l=Gi[o],l!==0&&(r-=er[o],Se(e,r,l)));while(a<e.sym_next);Be(e,$n,i)},Nr=(e,i)=>{const t=i.dyn_tree,r=i.stat_desc.static_tree,n=i.stat_desc.has_stree,a=i.stat_desc.elems;let o,l,u=-1,c;for(e.heap_len=0,e.heap_max=fs,o=0;o<a;o++)t[o*2]!==0?(e.heap[++e.heap_len]=u=o,e.depth[o]=0):t[o*2+1]=0;for(;e.heap_len<2;)c=e.heap[++e.heap_len]=u<2?++u:0,t[c*2]=1,e.depth[c]=0,e.opt_len--,n&&(e.static_len-=r[c*2+1]);for(i.max_code=u,o=e.heap_len>>1;o>=1;o--)kr(e,t,o);c=a;do o=e.heap[1],e.heap[1]=e.heap[e.heap_len--],kr(e,t,1),l=e.heap[1],e.heap[--e.heap_max]=o,e.heap[--e.heap_max]=l,t[c*2]=t[o*2]+t[l*2],e.depth[c]=(e.depth[o]>=e.depth[l]?e.depth[o]:e.depth[l])+1,t[o*2+1]=t[l*2+1]=c,e.heap[1]=c++,kr(e,t,1);while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],Zl(e,i),xs(t,u,e.bl_count)},na=(e,i,t)=>{let r,n=-1,a,o=i[0*2+1],l=0,u=7,c=4;for(o===0&&(u=138,c=3),i[(t+1)*2+1]=65535,r=0;r<=t;r++)a=o,o=i[(r+1)*2+1],!(++l<u&&a===o)&&(l<c?e.bl_tree[a*2]+=l:a!==0?(a!==n&&e.bl_tree[a*2]++,e.bl_tree[ps*2]++):l<=10?e.bl_tree[gs*2]++:e.bl_tree[bs*2]++,l=0,n=a,o===0?(u=138,c=3):a===o?(u=6,c=3):(u=7,c=4))},aa=(e,i,t)=>{let r,n=-1,a,o=i[0*2+1],l=0,u=7,c=4;for(o===0&&(u=138,c=3),r=0;r<=t;r++)if(a=o,o=i[(r+1)*2+1],!(++l<u&&a===o)){if(l<c)do Be(e,a,e.bl_tree);while(--l!==0);else a!==0?(a!==n&&(Be(e,a,e.bl_tree),l--),Be(e,ps,e.bl_tree),Se(e,l-3,2)):l<=10?(Be(e,gs,e.bl_tree),Se(e,l-3,3)):(Be(e,bs,e.bl_tree),Se(e,l-11,7));l=0,n=a,o===0?(u=138,c=3):a===o?(u=6,c=3):(u=7,c=4)}},jl=e=>{let i;for(na(e,e.dyn_ltree,e.l_desc.max_code),na(e,e.dyn_dtree,e.d_desc.max_code),Nr(e,e.bl_desc),i=Sn-1;i>=3&&e.bl_tree[ms[i]*2+1]===0;i--);return e.opt_len+=3*(i+1)+5+5+4,i},ql=(e,i,t,r)=>{let n;for(Se(e,i-257,5),Se(e,t-1,5),Se(e,r-4,4),n=0;n<r;n++)Se(e,e.bl_tree[ms[n]*2+1],3);aa(e,e.dyn_ltree,i-1),aa(e,e.dyn_dtree,t-1)},Vl=e=>{let i=4093624447,t;for(t=0;t<=31;t++,i>>>=1)if(i&1&&e.dyn_ltree[t*2]!==0)return ea;if(e.dyn_ltree[9*2]!==0||e.dyn_ltree[10*2]!==0||e.dyn_ltree[13*2]!==0)return ta;for(t=32;t<Si;t++)if(e.dyn_ltree[t*2]!==0)return ta;return ea};let sa=!1;const Gl=e=>{sa||(Hl(),sa=!0),e.l_desc=new yr(e.dyn_ltree,ws),e.d_desc=new yr(e.dyn_dtree,_s),e.bl_desc=new yr(e.bl_tree,vs),e.bi_buf=0,e.bi_valid=0,Ss(e)},As=(e,i,t,r)=>{Se(e,(Dl<<1)+(r?1:0),3),$s(e),pi(e,t),pi(e,~t),t&&e.pending_buf.set(e.window.subarray(i,i+t),e.pending),e.pending+=t},Wl=e=>{Se(e,us<<1,3),Be(e,$n,qe),Nl(e)},Yl=(e,i,t,r)=>{let n,a,o=0;e.level>0?(e.strm.data_type===Ol&&(e.strm.data_type=Vl(e)),Nr(e,e.l_desc),Nr(e,e.d_desc),o=jl(e),n=e.opt_len+3+7>>>3,a=e.static_len+3+7>>>3,a<=n&&(n=a)):n=a=t+5,t+4<=n&&i!==-1?As(e,i,t,r):e.strategy===Ul||a===n?(Se(e,(us<<1)+(r?1:0),3),ra(e,qe,ai)):(Se(e,(Il<<1)+(r?1:0),3),ql(e,e.l_desc.max_code+1,e.d_desc.max_code+1,o+1),ra(e,e.dyn_ltree,e.dyn_dtree)),Ss(e),r&&$s(e)},Kl=(e,i,t)=>(e.pending_buf[e.sym_buf+e.sym_next++]=i,e.pending_buf[e.sym_buf+e.sym_next++]=i>>8,e.pending_buf[e.sym_buf+e.sym_next++]=t,i===0?e.dyn_ltree[t*2]++:(e.matches++,i--,e.dyn_ltree[(fi[t]+Si+1)*2]++,e.dyn_dtree[ys(i)*2]++),e.sym_next===e.sym_end);var Xl=Gl,Jl=As,Ql=Yl,ec=Kl,tc=Wl,ic={_tr_init:Xl,_tr_stored_block:Jl,_tr_flush_block:Ql,_tr_tally:ec,_tr_align:tc};const rc=(e,i,t,r)=>{let n=e&65535|0,a=e>>>16&65535|0,o=0;for(;t!==0;){o=t>2e3?2e3:t,t-=o;do n=n+i[r++]|0,a=a+n|0;while(--o);n%=65521,a%=65521}return n|a<<16|0};var gi=rc;const nc=()=>{let e,i=[];for(var t=0;t<256;t++){e=t;for(var r=0;r<8;r++)e=e&1?3988292384^e>>>1:e>>>1;i[t]=e}return i},ac=new Uint32Array(nc()),sc=(e,i,t,r)=>{const n=ac,a=r+t;e^=-1;for(let o=r;o<a;o++)e=e>>>8^n[(e^i[o])&255];return e^-1};var me=sc,yt={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},$i={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};const{_tr_init:oc,_tr_stored_block:Zr,_tr_flush_block:lc,_tr_tally:it,_tr_align:cc}=ic,{Z_NO_FLUSH:rt,Z_PARTIAL_FLUSH:dc,Z_FULL_FLUSH:hc,Z_FINISH:Re,Z_BLOCK:oa,Z_OK:_e,Z_STREAM_END:la,Z_STREAM_ERROR:Fe,Z_DATA_ERROR:uc,Z_BUF_ERROR:xr,Z_DEFAULT_COMPRESSION:fc,Z_FILTERED:pc,Z_HUFFMAN_ONLY:Fi,Z_RLE:gc,Z_FIXED:bc,Z_DEFAULT_STRATEGY:mc,Z_UNKNOWN:wc,Z_DEFLATED:cr}=$i,_c=9,vc=15,yc=8,kc=29,xc=256,Hr=xc+1+kc,Sc=30,$c=19,Ac=2*Hr+1,Ec=15,ee=3,tt=258,Ne=tt+ee+1,Cc=32,Dt=42,En=57,jr=69,qr=73,Vr=91,Gr=103,gt=113,ti=666,xe=1,Lt=2,kt=3,Bt=4,Pc=3,bt=(e,i)=>(e.msg=yt[i],i),ca=e=>e*2-(e>4?9:0),et=e=>{let i=e.length;for(;--i>=0;)e[i]=0},Tc=e=>{let i,t,r,n=e.w_size;i=e.hash_size,r=i;do t=e.head[--r],e.head[r]=t>=n?t-n:0;while(--i);i=n,r=i;do t=e.prev[--r],e.prev[r]=t>=n?t-n:0;while(--i)};let Rc=(e,i,t)=>(i<<e.hash_shift^t)&e.hash_mask,nt=Rc;const Ee=e=>{const i=e.state;let t=i.pending;t>e.avail_out&&(t=e.avail_out),t!==0&&(e.output.set(i.pending_buf.subarray(i.pending_out,i.pending_out+t),e.next_out),e.next_out+=t,i.pending_out+=t,e.total_out+=t,e.avail_out-=t,i.pending-=t,i.pending===0&&(i.pending_out=0))},Ce=(e,i)=>{lc(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,i),e.block_start=e.strstart,Ee(e.strm)},re=(e,i)=>{e.pending_buf[e.pending++]=i},ei=(e,i)=>{e.pending_buf[e.pending++]=i>>>8&255,e.pending_buf[e.pending++]=i&255},Wr=(e,i,t,r)=>{let n=e.avail_in;return n>r&&(n=r),n===0?0:(e.avail_in-=n,i.set(e.input.subarray(e.next_in,e.next_in+n),t),e.state.wrap===1?e.adler=gi(e.adler,i,n,t):e.state.wrap===2&&(e.adler=me(e.adler,i,n,t)),e.next_in+=n,e.total_in+=n,n)},Es=(e,i)=>{let t=e.max_chain_length,r=e.strstart,n,a,o=e.prev_length,l=e.nice_match;const u=e.strstart>e.w_size-Ne?e.strstart-(e.w_size-Ne):0,c=e.window,h=e.w_mask,x=e.prev,y=e.strstart+tt;let v=c[r+o-1],E=c[r+o];e.prev_length>=e.good_match&&(t>>=2),l>e.lookahead&&(l=e.lookahead);do if(n=i,!(c[n+o]!==E||c[n+o-1]!==v||c[n]!==c[r]||c[++n]!==c[r+1])){r+=2,n++;do;while(c[++r]===c[++n]&&c[++r]===c[++n]&&c[++r]===c[++n]&&c[++r]===c[++n]&&c[++r]===c[++n]&&c[++r]===c[++n]&&c[++r]===c[++n]&&c[++r]===c[++n]&&r<y);if(a=tt-(y-r),r=y-tt,a>o){if(e.match_start=i,o=a,a>=l)break;v=c[r+o-1],E=c[r+o]}}while((i=x[i&h])>u&&--t!==0);return o<=e.lookahead?o:e.lookahead},It=e=>{const i=e.w_size;let t,r,n;do{if(r=e.window_size-e.lookahead-e.strstart,e.strstart>=i+(i-Ne)&&(e.window.set(e.window.subarray(i,i+i-r),0),e.match_start-=i,e.strstart-=i,e.block_start-=i,e.insert>e.strstart&&(e.insert=e.strstart),Tc(e),r+=i),e.strm.avail_in===0)break;if(t=Wr(e.strm,e.window,e.strstart+e.lookahead,r),e.lookahead+=t,e.lookahead+e.insert>=ee)for(n=e.strstart-e.insert,e.ins_h=e.window[n],e.ins_h=nt(e,e.ins_h,e.window[n+1]);e.insert&&(e.ins_h=nt(e,e.ins_h,e.window[n+ee-1]),e.prev[n&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=n,n++,e.insert--,!(e.lookahead+e.insert<ee)););}while(e.lookahead<Ne&&e.strm.avail_in!==0)},Cs=(e,i)=>{let t=e.pending_buf_size-5>e.w_size?e.w_size:e.pending_buf_size-5,r,n,a,o=0,l=e.strm.avail_in;do{if(r=65535,a=e.bi_valid+42>>3,e.strm.avail_out<a||(a=e.strm.avail_out-a,n=e.strstart-e.block_start,r>n+e.strm.avail_in&&(r=n+e.strm.avail_in),r>a&&(r=a),r<t&&(r===0&&i!==Re||i===rt||r!==n+e.strm.avail_in)))break;o=i===Re&&r===n+e.strm.avail_in?1:0,Zr(e,0,0,o),e.pending_buf[e.pending-4]=r,e.pending_buf[e.pending-3]=r>>8,e.pending_buf[e.pending-2]=~r,e.pending_buf[e.pending-1]=~r>>8,Ee(e.strm),n&&(n>r&&(n=r),e.strm.output.set(e.window.subarray(e.block_start,e.block_start+n),e.strm.next_out),e.strm.next_out+=n,e.strm.avail_out-=n,e.strm.total_out+=n,e.block_start+=n,r-=n),r&&(Wr(e.strm,e.strm.output,e.strm.next_out,r),e.strm.next_out+=r,e.strm.avail_out-=r,e.strm.total_out+=r)}while(o===0);return l-=e.strm.avail_in,l&&(l>=e.w_size?(e.matches=2,e.window.set(e.strm.input.subarray(e.strm.next_in-e.w_size,e.strm.next_in),0),e.strstart=e.w_size,e.insert=e.strstart):(e.window_size-e.strstart<=l&&(e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,e.insert>e.strstart&&(e.insert=e.strstart)),e.window.set(e.strm.input.subarray(e.strm.next_in-l,e.strm.next_in),e.strstart),e.strstart+=l,e.insert+=l>e.w_size-e.insert?e.w_size-e.insert:l),e.block_start=e.strstart),e.high_water<e.strstart&&(e.high_water=e.strstart),o?Bt:i!==rt&&i!==Re&&e.strm.avail_in===0&&e.strstart===e.block_start?Lt:(a=e.window_size-e.strstart,e.strm.avail_in>a&&e.block_start>=e.w_size&&(e.block_start-=e.w_size,e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,a+=e.w_size,e.insert>e.strstart&&(e.insert=e.strstart)),a>e.strm.avail_in&&(a=e.strm.avail_in),a&&(Wr(e.strm,e.window,e.strstart,a),e.strstart+=a,e.insert+=a>e.w_size-e.insert?e.w_size-e.insert:a),e.high_water<e.strstart&&(e.high_water=e.strstart),a=e.bi_valid+42>>3,a=e.pending_buf_size-a>65535?65535:e.pending_buf_size-a,t=a>e.w_size?e.w_size:a,n=e.strstart-e.block_start,(n>=t||(n||i===Re)&&i!==rt&&e.strm.avail_in===0&&n<=a)&&(r=n>a?a:n,o=i===Re&&e.strm.avail_in===0&&r===n?1:0,Zr(e,e.block_start,r,o),e.block_start+=r,Ee(e.strm)),o?kt:xe)},Sr=(e,i)=>{let t,r;for(;;){if(e.lookahead<Ne){if(It(e),e.lookahead<Ne&&i===rt)return xe;if(e.lookahead===0)break}if(t=0,e.lookahead>=ee&&(e.ins_h=nt(e,e.ins_h,e.window[e.strstart+ee-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),t!==0&&e.strstart-t<=e.w_size-Ne&&(e.match_length=Es(e,t)),e.match_length>=ee)if(r=it(e,e.strstart-e.match_start,e.match_length-ee),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=ee){e.match_length--;do e.strstart++,e.ins_h=nt(e,e.ins_h,e.window[e.strstart+ee-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart;while(--e.match_length!==0);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=nt(e,e.ins_h,e.window[e.strstart+1]);else r=it(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(r&&(Ce(e,!1),e.strm.avail_out===0))return xe}return e.insert=e.strstart<ee-1?e.strstart:ee-1,i===Re?(Ce(e,!0),e.strm.avail_out===0?kt:Bt):e.sym_next&&(Ce(e,!1),e.strm.avail_out===0)?xe:Lt},Et=(e,i)=>{let t,r,n;for(;;){if(e.lookahead<Ne){if(It(e),e.lookahead<Ne&&i===rt)return xe;if(e.lookahead===0)break}if(t=0,e.lookahead>=ee&&(e.ins_h=nt(e,e.ins_h,e.window[e.strstart+ee-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=ee-1,t!==0&&e.prev_length<e.max_lazy_match&&e.strstart-t<=e.w_size-Ne&&(e.match_length=Es(e,t),e.match_length<=5&&(e.strategy===pc||e.match_length===ee&&e.strstart-e.match_start>4096)&&(e.match_length=ee-1)),e.prev_length>=ee&&e.match_length<=e.prev_length){n=e.strstart+e.lookahead-ee,r=it(e,e.strstart-1-e.prev_match,e.prev_length-ee),e.lookahead-=e.prev_length-1,e.prev_length-=2;do++e.strstart<=n&&(e.ins_h=nt(e,e.ins_h,e.window[e.strstart+ee-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart);while(--e.prev_length!==0);if(e.match_available=0,e.match_length=ee-1,e.strstart++,r&&(Ce(e,!1),e.strm.avail_out===0))return xe}else if(e.match_available){if(r=it(e,0,e.window[e.strstart-1]),r&&Ce(e,!1),e.strstart++,e.lookahead--,e.strm.avail_out===0)return xe}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(r=it(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<ee-1?e.strstart:ee-1,i===Re?(Ce(e,!0),e.strm.avail_out===0?kt:Bt):e.sym_next&&(Ce(e,!1),e.strm.avail_out===0)?xe:Lt},Uc=(e,i)=>{let t,r,n,a;const o=e.window;for(;;){if(e.lookahead<=tt){if(It(e),e.lookahead<=tt&&i===rt)return xe;if(e.lookahead===0)break}if(e.match_length=0,e.lookahead>=ee&&e.strstart>0&&(n=e.strstart-1,r=o[n],r===o[++n]&&r===o[++n]&&r===o[++n])){a=e.strstart+tt;do;while(r===o[++n]&&r===o[++n]&&r===o[++n]&&r===o[++n]&&r===o[++n]&&r===o[++n]&&r===o[++n]&&r===o[++n]&&n<a);e.match_length=tt-(a-n),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=ee?(t=it(e,1,e.match_length-ee),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(t=it(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),t&&(Ce(e,!1),e.strm.avail_out===0))return xe}return e.insert=0,i===Re?(Ce(e,!0),e.strm.avail_out===0?kt:Bt):e.sym_next&&(Ce(e,!1),e.strm.avail_out===0)?xe:Lt},Oc=(e,i)=>{let t;for(;;){if(e.lookahead===0&&(It(e),e.lookahead===0)){if(i===rt)return xe;break}if(e.match_length=0,t=it(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,t&&(Ce(e,!1),e.strm.avail_out===0))return xe}return e.insert=0,i===Re?(Ce(e,!0),e.strm.avail_out===0?kt:Bt):e.sym_next&&(Ce(e,!1),e.strm.avail_out===0)?xe:Lt};function ze(e,i,t,r,n){this.good_length=e,this.max_lazy=i,this.nice_length=t,this.max_chain=r,this.func=n}const ii=[new ze(0,0,0,0,Cs),new ze(4,4,8,4,Sr),new ze(4,5,16,8,Sr),new ze(4,6,32,32,Sr),new ze(4,4,16,16,Et),new ze(8,16,32,32,Et),new ze(8,16,128,128,Et),new ze(8,32,128,256,Et),new ze(32,128,258,1024,Et),new ze(32,258,258,4096,Et)],Dc=e=>{e.window_size=2*e.w_size,et(e.head),e.max_lazy_match=ii[e.level].max_lazy,e.good_match=ii[e.level].good_length,e.nice_match=ii[e.level].nice_length,e.max_chain_length=ii[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=ee-1,e.match_available=0,e.ins_h=0};function Ic(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=cr,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Uint16Array(Ac*2),this.dyn_dtree=new Uint16Array((2*Sc+1)*2),this.bl_tree=new Uint16Array((2*$c+1)*2),et(this.dyn_ltree),et(this.dyn_dtree),et(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Uint16Array(Ec+1),this.heap=new Uint16Array(2*Hr+1),et(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Uint16Array(2*Hr+1),et(this.depth),this.sym_buf=0,this.lit_bufsize=0,this.sym_next=0,this.sym_end=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}const Ai=e=>{if(!e)return 1;const i=e.state;return!i||i.strm!==e||i.status!==Dt&&i.status!==En&&i.status!==jr&&i.status!==qr&&i.status!==Vr&&i.status!==Gr&&i.status!==gt&&i.status!==ti?1:0},Ps=e=>{if(Ai(e))return bt(e,Fe);e.total_in=e.total_out=0,e.data_type=wc;const i=e.state;return i.pending=0,i.pending_out=0,i.wrap<0&&(i.wrap=-i.wrap),i.status=i.wrap===2?En:i.wrap?Dt:gt,e.adler=i.wrap===2?0:1,i.last_flush=-2,oc(i),_e},Ts=e=>{const i=Ps(e);return i===_e&&Dc(e.state),i},Mc=(e,i)=>Ai(e)||e.state.wrap!==2?Fe:(e.state.gzhead=i,_e),Rs=(e,i,t,r,n,a)=>{if(!e)return Fe;let o=1;if(i===fc&&(i=6),r<0?(o=0,r=-r):r>15&&(o=2,r-=16),n<1||n>_c||t!==cr||r<8||r>15||i<0||i>9||a<0||a>bc||r===8&&o!==1)return bt(e,Fe);r===8&&(r=9);const l=new Ic;return e.state=l,l.strm=e,l.status=Dt,l.wrap=o,l.gzhead=null,l.w_bits=r,l.w_size=1<<l.w_bits,l.w_mask=l.w_size-1,l.hash_bits=n+7,l.hash_size=1<<l.hash_bits,l.hash_mask=l.hash_size-1,l.hash_shift=~~((l.hash_bits+ee-1)/ee),l.window=new Uint8Array(l.w_size*2),l.head=new Uint16Array(l.hash_size),l.prev=new Uint16Array(l.w_size),l.lit_bufsize=1<<n+6,l.pending_buf_size=l.lit_bufsize*4,l.pending_buf=new Uint8Array(l.pending_buf_size),l.sym_buf=l.lit_bufsize,l.sym_end=(l.lit_bufsize-1)*3,l.level=i,l.strategy=a,l.method=t,Ts(e)},zc=(e,i)=>Rs(e,i,cr,vc,yc,mc),Lc=(e,i)=>{if(Ai(e)||i>oa||i<0)return e?bt(e,Fe):Fe;const t=e.state;if(!e.output||e.avail_in!==0&&!e.input||t.status===ti&&i!==Re)return bt(e,e.avail_out===0?xr:Fe);const r=t.last_flush;if(t.last_flush=i,t.pending!==0){if(Ee(e),e.avail_out===0)return t.last_flush=-1,_e}else if(e.avail_in===0&&ca(i)<=ca(r)&&i!==Re)return bt(e,xr);if(t.status===ti&&e.avail_in!==0)return bt(e,xr);if(t.status===Dt&&t.wrap===0&&(t.status=gt),t.status===Dt){let n=cr+(t.w_bits-8<<4)<<8,a=-1;if(t.strategy>=Fi||t.level<2?a=0:t.level<6?a=1:t.level===6?a=2:a=3,n|=a<<6,t.strstart!==0&&(n|=Cc),n+=31-n%31,ei(t,n),t.strstart!==0&&(ei(t,e.adler>>>16),ei(t,e.adler&65535)),e.adler=1,t.status=gt,Ee(e),t.pending!==0)return t.last_flush=-1,_e}if(t.status===En){if(e.adler=0,re(t,31),re(t,139),re(t,8),t.gzhead)re(t,(t.gzhead.text?1:0)+(t.gzhead.hcrc?2:0)+(t.gzhead.extra?4:0)+(t.gzhead.name?8:0)+(t.gzhead.comment?16:0)),re(t,t.gzhead.time&255),re(t,t.gzhead.time>>8&255),re(t,t.gzhead.time>>16&255),re(t,t.gzhead.time>>24&255),re(t,t.level===9?2:t.strategy>=Fi||t.level<2?4:0),re(t,t.gzhead.os&255),t.gzhead.extra&&t.gzhead.extra.length&&(re(t,t.gzhead.extra.length&255),re(t,t.gzhead.extra.length>>8&255)),t.gzhead.hcrc&&(e.adler=me(e.adler,t.pending_buf,t.pending,0)),t.gzindex=0,t.status=jr;else if(re(t,0),re(t,0),re(t,0),re(t,0),re(t,0),re(t,t.level===9?2:t.strategy>=Fi||t.level<2?4:0),re(t,Pc),t.status=gt,Ee(e),t.pending!==0)return t.last_flush=-1,_e}if(t.status===jr){if(t.gzhead.extra){let n=t.pending,a=(t.gzhead.extra.length&65535)-t.gzindex;for(;t.pending+a>t.pending_buf_size;){let l=t.pending_buf_size-t.pending;if(t.pending_buf.set(t.gzhead.extra.subarray(t.gzindex,t.gzindex+l),t.pending),t.pending=t.pending_buf_size,t.gzhead.hcrc&&t.pending>n&&(e.adler=me(e.adler,t.pending_buf,t.pending-n,n)),t.gzindex+=l,Ee(e),t.pending!==0)return t.last_flush=-1,_e;n=0,a-=l}let o=new Uint8Array(t.gzhead.extra);t.pending_buf.set(o.subarray(t.gzindex,t.gzindex+a),t.pending),t.pending+=a,t.gzhead.hcrc&&t.pending>n&&(e.adler=me(e.adler,t.pending_buf,t.pending-n,n)),t.gzindex=0}t.status=qr}if(t.status===qr){if(t.gzhead.name){let n=t.pending,a;do{if(t.pending===t.pending_buf_size){if(t.gzhead.hcrc&&t.pending>n&&(e.adler=me(e.adler,t.pending_buf,t.pending-n,n)),Ee(e),t.pending!==0)return t.last_flush=-1,_e;n=0}t.gzindex<t.gzhead.name.length?a=t.gzhead.name.charCodeAt(t.gzindex++)&255:a=0,re(t,a)}while(a!==0);t.gzhead.hcrc&&t.pending>n&&(e.adler=me(e.adler,t.pending_buf,t.pending-n,n)),t.gzindex=0}t.status=Vr}if(t.status===Vr){if(t.gzhead.comment){let n=t.pending,a;do{if(t.pending===t.pending_buf_size){if(t.gzhead.hcrc&&t.pending>n&&(e.adler=me(e.adler,t.pending_buf,t.pending-n,n)),Ee(e),t.pending!==0)return t.last_flush=-1,_e;n=0}t.gzindex<t.gzhead.comment.length?a=t.gzhead.comment.charCodeAt(t.gzindex++)&255:a=0,re(t,a)}while(a!==0);t.gzhead.hcrc&&t.pending>n&&(e.adler=me(e.adler,t.pending_buf,t.pending-n,n))}t.status=Gr}if(t.status===Gr){if(t.gzhead.hcrc){if(t.pending+2>t.pending_buf_size&&(Ee(e),t.pending!==0))return t.last_flush=-1,_e;re(t,e.adler&255),re(t,e.adler>>8&255),e.adler=0}if(t.status=gt,Ee(e),t.pending!==0)return t.last_flush=-1,_e}if(e.avail_in!==0||t.lookahead!==0||i!==rt&&t.status!==ti){let n=t.level===0?Cs(t,i):t.strategy===Fi?Oc(t,i):t.strategy===gc?Uc(t,i):ii[t.level].func(t,i);if((n===kt||n===Bt)&&(t.status=ti),n===xe||n===kt)return e.avail_out===0&&(t.last_flush=-1),_e;if(n===Lt&&(i===dc?cc(t):i!==oa&&(Zr(t,0,0,!1),i===hc&&(et(t.head),t.lookahead===0&&(t.strstart=0,t.block_start=0,t.insert=0))),Ee(e),e.avail_out===0))return t.last_flush=-1,_e}return i!==Re?_e:t.wrap<=0?la:(t.wrap===2?(re(t,e.adler&255),re(t,e.adler>>8&255),re(t,e.adler>>16&255),re(t,e.adler>>24&255),re(t,e.total_in&255),re(t,e.total_in>>8&255),re(t,e.total_in>>16&255),re(t,e.total_in>>24&255)):(ei(t,e.adler>>>16),ei(t,e.adler&65535)),Ee(e),t.wrap>0&&(t.wrap=-t.wrap),t.pending!==0?_e:la)},Bc=e=>{if(Ai(e))return Fe;const i=e.state.status;return e.state=null,i===gt?bt(e,uc):_e},Fc=(e,i)=>{let t=i.length;if(Ai(e))return Fe;const r=e.state,n=r.wrap;if(n===2||n===1&&r.status!==Dt||r.lookahead)return Fe;if(n===1&&(e.adler=gi(e.adler,i,t,0)),r.wrap=0,t>=r.w_size){n===0&&(et(r.head),r.strstart=0,r.block_start=0,r.insert=0);let u=new Uint8Array(r.w_size);u.set(i.subarray(t-r.w_size,t),0),i=u,t=r.w_size}const a=e.avail_in,o=e.next_in,l=e.input;for(e.avail_in=t,e.next_in=0,e.input=i,It(r);r.lookahead>=ee;){let u=r.strstart,c=r.lookahead-(ee-1);do r.ins_h=nt(r,r.ins_h,r.window[u+ee-1]),r.prev[u&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=u,u++;while(--c);r.strstart=u,r.lookahead=ee-1,It(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=ee-1,r.match_available=0,e.next_in=o,e.input=l,e.avail_in=a,r.wrap=n,_e};var Nc=zc,Zc=Rs,Hc=Ts,jc=Ps,qc=Mc,Vc=Lc,Gc=Bc,Wc=Fc,Yc="pako deflate (from Nodeca project)",si={deflateInit:Nc,deflateInit2:Zc,deflateReset:Hc,deflateResetKeep:jc,deflateSetHeader:qc,deflate:Vc,deflateEnd:Gc,deflateSetDictionary:Wc,deflateInfo:Yc};const Kc=(e,i)=>Object.prototype.hasOwnProperty.call(e,i);var Xc=function(e){const i=Array.prototype.slice.call(arguments,1);for(;i.length;){const t=i.shift();if(t){if(typeof t!="object")throw new TypeError(t+"must be non-object");for(const r in t)Kc(t,r)&&(e[r]=t[r])}}return e},Jc=e=>{let i=0;for(let r=0,n=e.length;r<n;r++)i+=e[r].length;const t=new Uint8Array(i);for(let r=0,n=0,a=e.length;r<a;r++){let o=e[r];t.set(o,n),n+=o.length}return t},dr={assign:Xc,flattenChunks:Jc};let Us=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{Us=!1}const bi=new Uint8Array(256);for(let e=0;e<256;e++)bi[e]=e>=252?6:e>=248?5:e>=240?4:e>=224?3:e>=192?2:1;bi[254]=bi[254]=1;var Qc=e=>{if(typeof TextEncoder=="function"&&TextEncoder.prototype.encode)return new TextEncoder().encode(e);let i,t,r,n,a,o=e.length,l=0;for(n=0;n<o;n++)t=e.charCodeAt(n),(t&64512)===55296&&n+1<o&&(r=e.charCodeAt(n+1),(r&64512)===56320&&(t=65536+(t-55296<<10)+(r-56320),n++)),l+=t<128?1:t<2048?2:t<65536?3:4;for(i=new Uint8Array(l),a=0,n=0;a<l;n++)t=e.charCodeAt(n),(t&64512)===55296&&n+1<o&&(r=e.charCodeAt(n+1),(r&64512)===56320&&(t=65536+(t-55296<<10)+(r-56320),n++)),t<128?i[a++]=t:t<2048?(i[a++]=192|t>>>6,i[a++]=128|t&63):t<65536?(i[a++]=224|t>>>12,i[a++]=128|t>>>6&63,i[a++]=128|t&63):(i[a++]=240|t>>>18,i[a++]=128|t>>>12&63,i[a++]=128|t>>>6&63,i[a++]=128|t&63);return i};const ed=(e,i)=>{if(i<65534&&e.subarray&&Us)return String.fromCharCode.apply(null,e.length===i?e:e.subarray(0,i));let t="";for(let r=0;r<i;r++)t+=String.fromCharCode(e[r]);return t};var td=(e,i)=>{const t=i||e.length;if(typeof TextDecoder=="function"&&TextDecoder.prototype.decode)return new TextDecoder().decode(e.subarray(0,i));let r,n;const a=new Array(t*2);for(n=0,r=0;r<t;){let o=e[r++];if(o<128){a[n++]=o;continue}let l=bi[o];if(l>4){a[n++]=65533,r+=l-1;continue}for(o&=l===2?31:l===3?15:7;l>1&&r<t;)o=o<<6|e[r++]&63,l--;if(l>1){a[n++]=65533;continue}o<65536?a[n++]=o:(o-=65536,a[n++]=55296|o>>10&1023,a[n++]=56320|o&1023)}return ed(a,n)},id=(e,i)=>{i=i||e.length,i>e.length&&(i=e.length);let t=i-1;for(;t>=0&&(e[t]&192)===128;)t--;return t<0||t===0?i:t+bi[e[t]]>i?t:i},mi={string2buf:Qc,buf2string:td,utf8border:id};function rd(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}var Os=rd;const Ds=Object.prototype.toString,{Z_NO_FLUSH:nd,Z_SYNC_FLUSH:ad,Z_FULL_FLUSH:sd,Z_FINISH:od,Z_OK:tr,Z_STREAM_END:ld,Z_DEFAULT_COMPRESSION:cd,Z_DEFAULT_STRATEGY:dd,Z_DEFLATED:hd}=$i;function Ei(e){this.options=dr.assign({level:cd,method:hd,chunkSize:16384,windowBits:15,memLevel:8,strategy:dd},e||{});let i=this.options;i.raw&&i.windowBits>0?i.windowBits=-i.windowBits:i.gzip&&i.windowBits>0&&i.windowBits<16&&(i.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Os,this.strm.avail_out=0;let t=si.deflateInit2(this.strm,i.level,i.method,i.windowBits,i.memLevel,i.strategy);if(t!==tr)throw new Error(yt[t]);if(i.header&&si.deflateSetHeader(this.strm,i.header),i.dictionary){let r;if(typeof i.dictionary=="string"?r=mi.string2buf(i.dictionary):Ds.call(i.dictionary)==="[object ArrayBuffer]"?r=new Uint8Array(i.dictionary):r=i.dictionary,t=si.deflateSetDictionary(this.strm,r),t!==tr)throw new Error(yt[t]);this._dict_set=!0}}Ei.prototype.push=function(e,i){const t=this.strm,r=this.options.chunkSize;let n,a;if(this.ended)return!1;for(i===~~i?a=i:a=i===!0?od:nd,typeof e=="string"?t.input=mi.string2buf(e):Ds.call(e)==="[object ArrayBuffer]"?t.input=new Uint8Array(e):t.input=e,t.next_in=0,t.avail_in=t.input.length;;){if(t.avail_out===0&&(t.output=new Uint8Array(r),t.next_out=0,t.avail_out=r),(a===ad||a===sd)&&t.avail_out<=6){this.onData(t.output.subarray(0,t.next_out)),t.avail_out=0;continue}if(n=si.deflate(t,a),n===ld)return t.next_out>0&&this.onData(t.output.subarray(0,t.next_out)),n=si.deflateEnd(this.strm),this.onEnd(n),this.ended=!0,n===tr;if(t.avail_out===0){this.onData(t.output);continue}if(a>0&&t.next_out>0){this.onData(t.output.subarray(0,t.next_out)),t.avail_out=0;continue}if(t.avail_in===0)break}return!0};Ei.prototype.onData=function(e){this.chunks.push(e)};Ei.prototype.onEnd=function(e){e===tr&&(this.result=dr.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};function Cn(e,i){const t=new Ei(i);if(t.push(e,!0),t.err)throw t.msg||yt[t.err];return t.result}function ud(e,i){return i=i||{},i.raw=!0,Cn(e,i)}function fd(e,i){return i=i||{},i.gzip=!0,Cn(e,i)}var pd=Ei,gd=Cn,bd=ud,md=fd,wd={Deflate:pd,deflate:gd,deflateRaw:bd,gzip:md};const Ni=16209,_d=16191;var vd=function(i,t){let r,n,a,o,l,u,c,h,x,y,v,E,H,M,O,q,I,P,X,ce,D,te,G,z;const W=i.state;r=i.next_in,G=i.input,n=r+(i.avail_in-5),a=i.next_out,z=i.output,o=a-(t-i.avail_out),l=a+(i.avail_out-257),u=W.dmax,c=W.wsize,h=W.whave,x=W.wnext,y=W.window,v=W.hold,E=W.bits,H=W.lencode,M=W.distcode,O=(1<<W.lenbits)-1,q=(1<<W.distbits)-1;e:do{E<15&&(v+=G[r++]<<E,E+=8,v+=G[r++]<<E,E+=8),I=H[v&O];t:for(;;){if(P=I>>>24,v>>>=P,E-=P,P=I>>>16&255,P===0)z[a++]=I&65535;else if(P&16){X=I&65535,P&=15,P&&(E<P&&(v+=G[r++]<<E,E+=8),X+=v&(1<<P)-1,v>>>=P,E-=P),E<15&&(v+=G[r++]<<E,E+=8,v+=G[r++]<<E,E+=8),I=M[v&q];i:for(;;){if(P=I>>>24,v>>>=P,E-=P,P=I>>>16&255,P&16){if(ce=I&65535,P&=15,E<P&&(v+=G[r++]<<E,E+=8,E<P&&(v+=G[r++]<<E,E+=8)),ce+=v&(1<<P)-1,ce>u){i.msg="invalid distance too far back",W.mode=Ni;break e}if(v>>>=P,E-=P,P=a-o,ce>P){if(P=ce-P,P>h&&W.sane){i.msg="invalid distance too far back",W.mode=Ni;break e}if(D=0,te=y,x===0){if(D+=c-P,P<X){X-=P;do z[a++]=y[D++];while(--P);D=a-ce,te=z}}else if(x<P){if(D+=c+x-P,P-=x,P<X){X-=P;do z[a++]=y[D++];while(--P);if(D=0,x<X){P=x,X-=P;do z[a++]=y[D++];while(--P);D=a-ce,te=z}}}else if(D+=x-P,P<X){X-=P;do z[a++]=y[D++];while(--P);D=a-ce,te=z}for(;X>2;)z[a++]=te[D++],z[a++]=te[D++],z[a++]=te[D++],X-=3;X&&(z[a++]=te[D++],X>1&&(z[a++]=te[D++]))}else{D=a-ce;do z[a++]=z[D++],z[a++]=z[D++],z[a++]=z[D++],X-=3;while(X>2);X&&(z[a++]=z[D++],X>1&&(z[a++]=z[D++]))}}else if((P&64)===0){I=M[(I&65535)+(v&(1<<P)-1)];continue i}else{i.msg="invalid distance code",W.mode=Ni;break e}break}}else if((P&64)===0){I=H[(I&65535)+(v&(1<<P)-1)];continue t}else if(P&32){W.mode=_d;break e}else{i.msg="invalid literal/length code",W.mode=Ni;break e}break}}while(r<n&&a<l);X=E>>3,r-=X,E-=X<<3,v&=(1<<E)-1,i.next_in=r,i.next_out=a,i.avail_in=r<n?5+(n-r):5-(r-n),i.avail_out=a<l?257+(l-a):257-(a-l),W.hold=v,W.bits=E};const Ct=15,da=852,ha=592,ua=0,$r=1,fa=2,yd=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),kd=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),xd=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),Sd=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]),$d=(e,i,t,r,n,a,o,l)=>{const u=l.bits;let c=0,h=0,x=0,y=0,v=0,E=0,H=0,M=0,O=0,q=0,I,P,X,ce,D,te=null,G;const z=new Uint16Array(Ct+1),W=new Uint16Array(Ct+1);let Ae=null,He,Oe,De;for(c=0;c<=Ct;c++)z[c]=0;for(h=0;h<r;h++)z[i[t+h]]++;for(v=u,y=Ct;y>=1&&z[y]===0;y--);if(v>y&&(v=y),y===0)return n[a++]=1<<24|64<<16|0,n[a++]=1<<24|64<<16|0,l.bits=1,0;for(x=1;x<y&&z[x]===0;x++);for(v<x&&(v=x),M=1,c=1;c<=Ct;c++)if(M<<=1,M-=z[c],M<0)return-1;if(M>0&&(e===ua||y!==1))return-1;for(W[1]=0,c=1;c<Ct;c++)W[c+1]=W[c]+z[c];for(h=0;h<r;h++)i[t+h]!==0&&(o[W[i[t+h]]++]=h);if(e===ua?(te=Ae=o,G=20):e===$r?(te=yd,Ae=kd,G=257):(te=xd,Ae=Sd,G=0),q=0,h=0,c=x,D=a,E=v,H=0,X=-1,O=1<<v,ce=O-1,e===$r&&O>da||e===fa&&O>ha)return 1;for(;;){He=c-H,o[h]+1<G?(Oe=0,De=o[h]):o[h]>=G?(Oe=Ae[o[h]-G],De=te[o[h]-G]):(Oe=96,De=0),I=1<<c-H,P=1<<E,x=P;do P-=I,n[D+(q>>H)+P]=He<<24|Oe<<16|De|0;while(P!==0);for(I=1<<c-1;q&I;)I>>=1;if(I!==0?(q&=I-1,q+=I):q=0,h++,--z[c]===0){if(c===y)break;c=i[t+o[h]]}if(c>v&&(q&ce)!==X){for(H===0&&(H=v),D+=x,E=c-H,M=1<<E;E+H<y&&(M-=z[E+H],!(M<=0));)E++,M<<=1;if(O+=1<<E,e===$r&&O>da||e===fa&&O>ha)return 1;X=q&ce,n[X]=v<<24|E<<16|D-a|0}}return q!==0&&(n[D+q]=c-H<<24|64<<16|0),l.bits=v,0};var oi=$d;const Ad=0,Is=1,Ms=2,{Z_FINISH:pa,Z_BLOCK:Ed,Z_TREES:Zi,Z_OK:xt,Z_STREAM_END:Cd,Z_NEED_DICT:Pd,Z_STREAM_ERROR:Ue,Z_DATA_ERROR:zs,Z_MEM_ERROR:Ls,Z_BUF_ERROR:Td,Z_DEFLATED:ga}=$i,hr=16180,ba=16181,ma=16182,wa=16183,_a=16184,va=16185,ya=16186,ka=16187,xa=16188,Sa=16189,ir=16190,je=16191,Ar=16192,$a=16193,Er=16194,Aa=16195,Ea=16196,Ca=16197,Pa=16198,Hi=16199,ji=16200,Ta=16201,Ra=16202,Ua=16203,Oa=16204,Da=16205,Cr=16206,Ia=16207,Ma=16208,he=16209,Bs=16210,Fs=16211,Rd=852,Ud=592,Od=15,Dd=Od,za=e=>(e>>>24&255)+(e>>>8&65280)+((e&65280)<<8)+((e&255)<<24);function Id(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const $t=e=>{if(!e)return 1;const i=e.state;return!i||i.strm!==e||i.mode<hr||i.mode>Fs?1:0},Ns=e=>{if($t(e))return Ue;const i=e.state;return e.total_in=e.total_out=i.total=0,e.msg="",i.wrap&&(e.adler=i.wrap&1),i.mode=hr,i.last=0,i.havedict=0,i.flags=-1,i.dmax=32768,i.head=null,i.hold=0,i.bits=0,i.lencode=i.lendyn=new Int32Array(Rd),i.distcode=i.distdyn=new Int32Array(Ud),i.sane=1,i.back=-1,xt},Zs=e=>{if($t(e))return Ue;const i=e.state;return i.wsize=0,i.whave=0,i.wnext=0,Ns(e)},Hs=(e,i)=>{let t;if($t(e))return Ue;const r=e.state;return i<0?(t=0,i=-i):(t=(i>>4)+5,i<48&&(i&=15)),i&&(i<8||i>15)?Ue:(r.window!==null&&r.wbits!==i&&(r.window=null),r.wrap=t,r.wbits=i,Zs(e))},js=(e,i)=>{if(!e)return Ue;const t=new Id;e.state=t,t.strm=e,t.window=null,t.mode=hr;const r=Hs(e,i);return r!==xt&&(e.state=null),r},Md=e=>js(e,Dd);let La=!0,Pr,Tr;const zd=e=>{if(La){Pr=new Int32Array(512),Tr=new Int32Array(32);let i=0;for(;i<144;)e.lens[i++]=8;for(;i<256;)e.lens[i++]=9;for(;i<280;)e.lens[i++]=7;for(;i<288;)e.lens[i++]=8;for(oi(Is,e.lens,0,288,Pr,0,e.work,{bits:9}),i=0;i<32;)e.lens[i++]=5;oi(Ms,e.lens,0,32,Tr,0,e.work,{bits:5}),La=!1}e.lencode=Pr,e.lenbits=9,e.distcode=Tr,e.distbits=5},qs=(e,i,t,r)=>{let n;const a=e.state;return a.window===null&&(a.wsize=1<<a.wbits,a.wnext=0,a.whave=0,a.window=new Uint8Array(a.wsize)),r>=a.wsize?(a.window.set(i.subarray(t-a.wsize,t),0),a.wnext=0,a.whave=a.wsize):(n=a.wsize-a.wnext,n>r&&(n=r),a.window.set(i.subarray(t-r,t-r+n),a.wnext),r-=n,r?(a.window.set(i.subarray(t-r,t),0),a.wnext=r,a.whave=a.wsize):(a.wnext+=n,a.wnext===a.wsize&&(a.wnext=0),a.whave<a.wsize&&(a.whave+=n))),0},Ld=(e,i)=>{let t,r,n,a,o,l,u,c,h,x,y,v,E,H,M=0,O,q,I,P,X,ce,D,te;const G=new Uint8Array(4);let z,W;const Ae=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if($t(e)||!e.output||!e.input&&e.avail_in!==0)return Ue;t=e.state,t.mode===je&&(t.mode=Ar),o=e.next_out,n=e.output,u=e.avail_out,a=e.next_in,r=e.input,l=e.avail_in,c=t.hold,h=t.bits,x=l,y=u,te=xt;e:for(;;)switch(t.mode){case hr:if(t.wrap===0){t.mode=Ar;break}for(;h<16;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if(t.wrap&2&&c===35615){t.wbits===0&&(t.wbits=15),t.check=0,G[0]=c&255,G[1]=c>>>8&255,t.check=me(t.check,G,2,0),c=0,h=0,t.mode=ba;break}if(t.head&&(t.head.done=!1),!(t.wrap&1)||(((c&255)<<8)+(c>>8))%31){e.msg="incorrect header check",t.mode=he;break}if((c&15)!==ga){e.msg="unknown compression method",t.mode=he;break}if(c>>>=4,h-=4,D=(c&15)+8,t.wbits===0&&(t.wbits=D),D>15||D>t.wbits){e.msg="invalid window size",t.mode=he;break}t.dmax=1<<t.wbits,t.flags=0,e.adler=t.check=1,t.mode=c&512?Sa:je,c=0,h=0;break;case ba:for(;h<16;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if(t.flags=c,(t.flags&255)!==ga){e.msg="unknown compression method",t.mode=he;break}if(t.flags&57344){e.msg="unknown header flags set",t.mode=he;break}t.head&&(t.head.text=c>>8&1),t.flags&512&&t.wrap&4&&(G[0]=c&255,G[1]=c>>>8&255,t.check=me(t.check,G,2,0)),c=0,h=0,t.mode=ma;case ma:for(;h<32;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}t.head&&(t.head.time=c),t.flags&512&&t.wrap&4&&(G[0]=c&255,G[1]=c>>>8&255,G[2]=c>>>16&255,G[3]=c>>>24&255,t.check=me(t.check,G,4,0)),c=0,h=0,t.mode=wa;case wa:for(;h<16;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}t.head&&(t.head.xflags=c&255,t.head.os=c>>8),t.flags&512&&t.wrap&4&&(G[0]=c&255,G[1]=c>>>8&255,t.check=me(t.check,G,2,0)),c=0,h=0,t.mode=_a;case _a:if(t.flags&1024){for(;h<16;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}t.length=c,t.head&&(t.head.extra_len=c),t.flags&512&&t.wrap&4&&(G[0]=c&255,G[1]=c>>>8&255,t.check=me(t.check,G,2,0)),c=0,h=0}else t.head&&(t.head.extra=null);t.mode=va;case va:if(t.flags&1024&&(v=t.length,v>l&&(v=l),v&&(t.head&&(D=t.head.extra_len-t.length,t.head.extra||(t.head.extra=new Uint8Array(t.head.extra_len)),t.head.extra.set(r.subarray(a,a+v),D)),t.flags&512&&t.wrap&4&&(t.check=me(t.check,r,v,a)),l-=v,a+=v,t.length-=v),t.length))break e;t.length=0,t.mode=ya;case ya:if(t.flags&2048){if(l===0)break e;v=0;do D=r[a+v++],t.head&&D&&t.length<65536&&(t.head.name+=String.fromCharCode(D));while(D&&v<l);if(t.flags&512&&t.wrap&4&&(t.check=me(t.check,r,v,a)),l-=v,a+=v,D)break e}else t.head&&(t.head.name=null);t.length=0,t.mode=ka;case ka:if(t.flags&4096){if(l===0)break e;v=0;do D=r[a+v++],t.head&&D&&t.length<65536&&(t.head.comment+=String.fromCharCode(D));while(D&&v<l);if(t.flags&512&&t.wrap&4&&(t.check=me(t.check,r,v,a)),l-=v,a+=v,D)break e}else t.head&&(t.head.comment=null);t.mode=xa;case xa:if(t.flags&512){for(;h<16;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if(t.wrap&4&&c!==(t.check&65535)){e.msg="header crc mismatch",t.mode=he;break}c=0,h=0}t.head&&(t.head.hcrc=t.flags>>9&1,t.head.done=!0),e.adler=t.check=0,t.mode=je;break;case Sa:for(;h<32;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}e.adler=t.check=za(c),c=0,h=0,t.mode=ir;case ir:if(t.havedict===0)return e.next_out=o,e.avail_out=u,e.next_in=a,e.avail_in=l,t.hold=c,t.bits=h,Pd;e.adler=t.check=1,t.mode=je;case je:if(i===Ed||i===Zi)break e;case Ar:if(t.last){c>>>=h&7,h-=h&7,t.mode=Cr;break}for(;h<3;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}switch(t.last=c&1,c>>>=1,h-=1,c&3){case 0:t.mode=$a;break;case 1:if(zd(t),t.mode=Hi,i===Zi){c>>>=2,h-=2;break e}break;case 2:t.mode=Ea;break;case 3:e.msg="invalid block type",t.mode=he}c>>>=2,h-=2;break;case $a:for(c>>>=h&7,h-=h&7;h<32;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if((c&65535)!==(c>>>16^65535)){e.msg="invalid stored block lengths",t.mode=he;break}if(t.length=c&65535,c=0,h=0,t.mode=Er,i===Zi)break e;case Er:t.mode=Aa;case Aa:if(v=t.length,v){if(v>l&&(v=l),v>u&&(v=u),v===0)break e;n.set(r.subarray(a,a+v),o),l-=v,a+=v,u-=v,o+=v,t.length-=v;break}t.mode=je;break;case Ea:for(;h<14;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if(t.nlen=(c&31)+257,c>>>=5,h-=5,t.ndist=(c&31)+1,c>>>=5,h-=5,t.ncode=(c&15)+4,c>>>=4,h-=4,t.nlen>286||t.ndist>30){e.msg="too many length or distance symbols",t.mode=he;break}t.have=0,t.mode=Ca;case Ca:for(;t.have<t.ncode;){for(;h<3;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}t.lens[Ae[t.have++]]=c&7,c>>>=3,h-=3}for(;t.have<19;)t.lens[Ae[t.have++]]=0;if(t.lencode=t.lendyn,t.lenbits=7,z={bits:t.lenbits},te=oi(Ad,t.lens,0,19,t.lencode,0,t.work,z),t.lenbits=z.bits,te){e.msg="invalid code lengths set",t.mode=he;break}t.have=0,t.mode=Pa;case Pa:for(;t.have<t.nlen+t.ndist;){for(;M=t.lencode[c&(1<<t.lenbits)-1],O=M>>>24,q=M>>>16&255,I=M&65535,!(O<=h);){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if(I<16)c>>>=O,h-=O,t.lens[t.have++]=I;else{if(I===16){for(W=O+2;h<W;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if(c>>>=O,h-=O,t.have===0){e.msg="invalid bit length repeat",t.mode=he;break}D=t.lens[t.have-1],v=3+(c&3),c>>>=2,h-=2}else if(I===17){for(W=O+3;h<W;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}c>>>=O,h-=O,D=0,v=3+(c&7),c>>>=3,h-=3}else{for(W=O+7;h<W;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}c>>>=O,h-=O,D=0,v=11+(c&127),c>>>=7,h-=7}if(t.have+v>t.nlen+t.ndist){e.msg="invalid bit length repeat",t.mode=he;break}for(;v--;)t.lens[t.have++]=D}}if(t.mode===he)break;if(t.lens[256]===0){e.msg="invalid code -- missing end-of-block",t.mode=he;break}if(t.lenbits=9,z={bits:t.lenbits},te=oi(Is,t.lens,0,t.nlen,t.lencode,0,t.work,z),t.lenbits=z.bits,te){e.msg="invalid literal/lengths set",t.mode=he;break}if(t.distbits=6,t.distcode=t.distdyn,z={bits:t.distbits},te=oi(Ms,t.lens,t.nlen,t.ndist,t.distcode,0,t.work,z),t.distbits=z.bits,te){e.msg="invalid distances set",t.mode=he;break}if(t.mode=Hi,i===Zi)break e;case Hi:t.mode=ji;case ji:if(l>=6&&u>=258){e.next_out=o,e.avail_out=u,e.next_in=a,e.avail_in=l,t.hold=c,t.bits=h,vd(e,y),o=e.next_out,n=e.output,u=e.avail_out,a=e.next_in,r=e.input,l=e.avail_in,c=t.hold,h=t.bits,t.mode===je&&(t.back=-1);break}for(t.back=0;M=t.lencode[c&(1<<t.lenbits)-1],O=M>>>24,q=M>>>16&255,I=M&65535,!(O<=h);){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if(q&&(q&240)===0){for(P=O,X=q,ce=I;M=t.lencode[ce+((c&(1<<P+X)-1)>>P)],O=M>>>24,q=M>>>16&255,I=M&65535,!(P+O<=h);){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}c>>>=P,h-=P,t.back+=P}if(c>>>=O,h-=O,t.back+=O,t.length=I,q===0){t.mode=Da;break}if(q&32){t.back=-1,t.mode=je;break}if(q&64){e.msg="invalid literal/length code",t.mode=he;break}t.extra=q&15,t.mode=Ta;case Ta:if(t.extra){for(W=t.extra;h<W;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}t.length+=c&(1<<t.extra)-1,c>>>=t.extra,h-=t.extra,t.back+=t.extra}t.was=t.length,t.mode=Ra;case Ra:for(;M=t.distcode[c&(1<<t.distbits)-1],O=M>>>24,q=M>>>16&255,I=M&65535,!(O<=h);){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if((q&240)===0){for(P=O,X=q,ce=I;M=t.distcode[ce+((c&(1<<P+X)-1)>>P)],O=M>>>24,q=M>>>16&255,I=M&65535,!(P+O<=h);){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}c>>>=P,h-=P,t.back+=P}if(c>>>=O,h-=O,t.back+=O,q&64){e.msg="invalid distance code",t.mode=he;break}t.offset=I,t.extra=q&15,t.mode=Ua;case Ua:if(t.extra){for(W=t.extra;h<W;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}t.offset+=c&(1<<t.extra)-1,c>>>=t.extra,h-=t.extra,t.back+=t.extra}if(t.offset>t.dmax){e.msg="invalid distance too far back",t.mode=he;break}t.mode=Oa;case Oa:if(u===0)break e;if(v=y-u,t.offset>v){if(v=t.offset-v,v>t.whave&&t.sane){e.msg="invalid distance too far back",t.mode=he;break}v>t.wnext?(v-=t.wnext,E=t.wsize-v):E=t.wnext-v,v>t.length&&(v=t.length),H=t.window}else H=n,E=o-t.offset,v=t.length;v>u&&(v=u),u-=v,t.length-=v;do n[o++]=H[E++];while(--v);t.length===0&&(t.mode=ji);break;case Da:if(u===0)break e;n[o++]=t.length,u--,t.mode=ji;break;case Cr:if(t.wrap){for(;h<32;){if(l===0)break e;l--,c|=r[a++]<<h,h+=8}if(y-=u,e.total_out+=y,t.total+=y,t.wrap&4&&y&&(e.adler=t.check=t.flags?me(t.check,n,y,o-y):gi(t.check,n,y,o-y)),y=u,t.wrap&4&&(t.flags?c:za(c))!==t.check){e.msg="incorrect data check",t.mode=he;break}c=0,h=0}t.mode=Ia;case Ia:if(t.wrap&&t.flags){for(;h<32;){if(l===0)break e;l--,c+=r[a++]<<h,h+=8}if(t.wrap&4&&c!==(t.total&4294967295)){e.msg="incorrect length check",t.mode=he;break}c=0,h=0}t.mode=Ma;case Ma:te=Cd;break e;case he:te=zs;break e;case Bs:return Ls;case Fs:default:return Ue}return e.next_out=o,e.avail_out=u,e.next_in=a,e.avail_in=l,t.hold=c,t.bits=h,(t.wsize||y!==e.avail_out&&t.mode<he&&(t.mode<Cr||i!==pa))&&qs(e,e.output,e.next_out,y-e.avail_out),x-=e.avail_in,y-=e.avail_out,e.total_in+=x,e.total_out+=y,t.total+=y,t.wrap&4&&y&&(e.adler=t.check=t.flags?me(t.check,n,y,e.next_out-y):gi(t.check,n,y,e.next_out-y)),e.data_type=t.bits+(t.last?64:0)+(t.mode===je?128:0)+(t.mode===Hi||t.mode===Er?256:0),(x===0&&y===0||i===pa)&&te===xt&&(te=Td),te},Bd=e=>{if($t(e))return Ue;let i=e.state;return i.window&&(i.window=null),e.state=null,xt},Fd=(e,i)=>{if($t(e))return Ue;const t=e.state;return(t.wrap&2)===0?Ue:(t.head=i,i.done=!1,xt)},Nd=(e,i)=>{const t=i.length;let r,n,a;return $t(e)||(r=e.state,r.wrap!==0&&r.mode!==ir)?Ue:r.mode===ir&&(n=1,n=gi(n,i,t,0),n!==r.check)?zs:(a=qs(e,i,t,t),a?(r.mode=Bs,Ls):(r.havedict=1,xt))};var Zd=Zs,Hd=Hs,jd=Ns,qd=Md,Vd=js,Gd=Ld,Wd=Bd,Yd=Fd,Kd=Nd,Xd="pako inflate (from Nodeca project)",Ve={inflateReset:Zd,inflateReset2:Hd,inflateResetKeep:jd,inflateInit:qd,inflateInit2:Vd,inflate:Gd,inflateEnd:Wd,inflateGetHeader:Yd,inflateSetDictionary:Kd,inflateInfo:Xd};function Jd(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}var Qd=Jd;const Vs=Object.prototype.toString,{Z_NO_FLUSH:eh,Z_FINISH:th,Z_OK:wi,Z_STREAM_END:Rr,Z_NEED_DICT:Ur,Z_STREAM_ERROR:ih,Z_DATA_ERROR:Ba,Z_MEM_ERROR:rh}=$i;function Ci(e){this.options=dr.assign({chunkSize:1024*64,windowBits:15,to:""},e||{});const i=this.options;i.raw&&i.windowBits>=0&&i.windowBits<16&&(i.windowBits=-i.windowBits,i.windowBits===0&&(i.windowBits=-15)),i.windowBits>=0&&i.windowBits<16&&!(e&&e.windowBits)&&(i.windowBits+=32),i.windowBits>15&&i.windowBits<48&&(i.windowBits&15)===0&&(i.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Os,this.strm.avail_out=0;let t=Ve.inflateInit2(this.strm,i.windowBits);if(t!==wi)throw new Error(yt[t]);if(this.header=new Qd,Ve.inflateGetHeader(this.strm,this.header),i.dictionary&&(typeof i.dictionary=="string"?i.dictionary=mi.string2buf(i.dictionary):Vs.call(i.dictionary)==="[object ArrayBuffer]"&&(i.dictionary=new Uint8Array(i.dictionary)),i.raw&&(t=Ve.inflateSetDictionary(this.strm,i.dictionary),t!==wi)))throw new Error(yt[t])}Ci.prototype.push=function(e,i){const t=this.strm,r=this.options.chunkSize,n=this.options.dictionary;let a,o,l;if(this.ended)return!1;for(i===~~i?o=i:o=i===!0?th:eh,Vs.call(e)==="[object ArrayBuffer]"?t.input=new Uint8Array(e):t.input=e,t.next_in=0,t.avail_in=t.input.length;;){for(t.avail_out===0&&(t.output=new Uint8Array(r),t.next_out=0,t.avail_out=r),a=Ve.inflate(t,o),a===Ur&&n&&(a=Ve.inflateSetDictionary(t,n),a===wi?a=Ve.inflate(t,o):a===Ba&&(a=Ur));t.avail_in>0&&a===Rr&&t.state.wrap>0&&e[t.next_in]!==0;)Ve.inflateReset(t),a=Ve.inflate(t,o);switch(a){case ih:case Ba:case Ur:case rh:return this.onEnd(a),this.ended=!0,!1}if(l=t.avail_out,t.next_out&&(t.avail_out===0||a===Rr))if(this.options.to==="string"){let u=mi.utf8border(t.output,t.next_out),c=t.next_out-u,h=mi.buf2string(t.output,u);t.next_out=c,t.avail_out=r-c,c&&t.output.set(t.output.subarray(u,u+c),0),this.onData(h)}else this.onData(t.output.length===t.next_out?t.output:t.output.subarray(0,t.next_out));if(!(a===wi&&l===0)){if(a===Rr)return a=Ve.inflateEnd(this.strm),this.onEnd(a),this.ended=!0,!0;if(t.avail_in===0)break}}return!0};Ci.prototype.onData=function(e){this.chunks.push(e)};Ci.prototype.onEnd=function(e){e===wi&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=dr.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};function Pn(e,i){const t=new Ci(i);if(t.push(e),t.err)throw t.msg||yt[t.err];return t.result}function nh(e,i){return i=i||{},i.raw=!0,Pn(e,i)}var ah=Ci,sh=Pn,oh=nh,lh=Pn,ch={Inflate:ah,inflate:sh,inflateRaw:oh,ungzip:lh};const{Deflate:dh,deflate:hh,deflateRaw:uh,gzip:fh}=wd,{Inflate:ph,inflate:gh,inflateRaw:bh,ungzip:mh}=ch;var wh=dh,_h=hh,vh=uh,yh=fh,kh=ph,xh=gh,Sh=bh,$h=mh,Ah=$i,Yr={Deflate:wh,deflate:_h,deflateRaw:vh,gzip:yh,Inflate:kh,inflate:xh,inflateRaw:Sh,ungzip:$h,constants:Ah};const Eh=`/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).pako={})}(this,(function(e){"use strict";var t=(e,t,i,n)=>{let a=65535&e|0,r=e>>>16&65535|0,o=0;for(;0!==i;){o=i>2e3?2e3:i,i-=o;do{a=a+t[n++]|0,r=r+a|0}while(--o);a%=65521,r%=65521}return a|r<<16|0};const i=new Uint32Array((()=>{let e,t=[];for(var i=0;i<256;i++){e=i;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[i]=e}return t})());var n=(e,t,n,a)=>{const r=i,o=a+n;e^=-1;for(let i=a;i<o;i++)e=e>>>8^r[255&(e^t[i])];return-1^e};const a=16209;var r=function(e,t){let i,n,r,o,s,l,d,f,c,h,u,w,b,m,k,_,g,p,v,x,y,E,R,A;const Z=e.state;i=e.next_in,R=e.input,n=i+(e.avail_in-5),r=e.next_out,A=e.output,o=r-(t-e.avail_out),s=r+(e.avail_out-257),l=Z.dmax,d=Z.wsize,f=Z.whave,c=Z.wnext,h=Z.window,u=Z.hold,w=Z.bits,b=Z.lencode,m=Z.distcode,k=(1<<Z.lenbits)-1,_=(1<<Z.distbits)-1;e:do{w<15&&(u+=R[i++]<<w,w+=8,u+=R[i++]<<w,w+=8),g=b[u&k];t:for(;;){if(p=g>>>24,u>>>=p,w-=p,p=g>>>16&255,0===p)A[r++]=65535&g;else{if(!(16&p)){if(0==(64&p)){g=b[(65535&g)+(u&(1<<p)-1)];continue t}if(32&p){Z.mode=16191;break e}e.msg="invalid literal/length code",Z.mode=a;break e}v=65535&g,p&=15,p&&(w<p&&(u+=R[i++]<<w,w+=8),v+=u&(1<<p)-1,u>>>=p,w-=p),w<15&&(u+=R[i++]<<w,w+=8,u+=R[i++]<<w,w+=8),g=m[u&_];i:for(;;){if(p=g>>>24,u>>>=p,w-=p,p=g>>>16&255,!(16&p)){if(0==(64&p)){g=m[(65535&g)+(u&(1<<p)-1)];continue i}e.msg="invalid distance code",Z.mode=a;break e}if(x=65535&g,p&=15,w<p&&(u+=R[i++]<<w,w+=8,w<p&&(u+=R[i++]<<w,w+=8)),x+=u&(1<<p)-1,x>l){e.msg="invalid distance too far back",Z.mode=a;break e}if(u>>>=p,w-=p,p=r-o,x>p){if(p=x-p,p>f&&Z.sane){e.msg="invalid distance too far back",Z.mode=a;break e}if(y=0,E=h,0===c){if(y+=d-p,p<v){v-=p;do{A[r++]=h[y++]}while(--p);y=r-x,E=A}}else if(c<p){if(y+=d+c-p,p-=c,p<v){v-=p;do{A[r++]=h[y++]}while(--p);if(y=0,c<v){p=c,v-=p;do{A[r++]=h[y++]}while(--p);y=r-x,E=A}}}else if(y+=c-p,p<v){v-=p;do{A[r++]=h[y++]}while(--p);y=r-x,E=A}for(;v>2;)A[r++]=E[y++],A[r++]=E[y++],A[r++]=E[y++],v-=3;v&&(A[r++]=E[y++],v>1&&(A[r++]=E[y++]))}else{y=r-x;do{A[r++]=A[y++],A[r++]=A[y++],A[r++]=A[y++],v-=3}while(v>2);v&&(A[r++]=A[y++],v>1&&(A[r++]=A[y++]))}break}}break}}while(i<n&&r<s);v=w>>3,i-=v,w-=v<<3,u&=(1<<w)-1,e.next_in=i,e.next_out=r,e.avail_in=i<n?n-i+5:5-(i-n),e.avail_out=r<s?s-r+257:257-(r-s),Z.hold=u,Z.bits=w};const o=15,s=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),l=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),d=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),f=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]);var c=(e,t,i,n,a,r,c,h)=>{const u=h.bits;let w,b,m,k,_,g,p=0,v=0,x=0,y=0,E=0,R=0,A=0,Z=0,S=0,T=0,O=null;const U=new Uint16Array(16),D=new Uint16Array(16);let I,B,N,C=null;for(p=0;p<=o;p++)U[p]=0;for(v=0;v<n;v++)U[t[i+v]]++;for(E=u,y=o;y>=1&&0===U[y];y--);if(E>y&&(E=y),0===y)return a[r++]=20971520,a[r++]=20971520,h.bits=1,0;for(x=1;x<y&&0===U[x];x++);for(E<x&&(E=x),Z=1,p=1;p<=o;p++)if(Z<<=1,Z-=U[p],Z<0)return-1;if(Z>0&&(0===e||1!==y))return-1;for(D[1]=0,p=1;p<o;p++)D[p+1]=D[p]+U[p];for(v=0;v<n;v++)0!==t[i+v]&&(c[D[t[i+v]]++]=v);if(0===e?(O=C=c,g=20):1===e?(O=s,C=l,g=257):(O=d,C=f,g=0),T=0,v=0,p=x,_=r,R=E,A=0,m=-1,S=1<<E,k=S-1,1===e&&S>852||2===e&&S>592)return 1;for(;;){I=p-A,c[v]+1<g?(B=0,N=c[v]):c[v]>=g?(B=C[c[v]-g],N=O[c[v]-g]):(B=96,N=0),w=1<<p-A,b=1<<R,x=b;do{b-=w,a[_+(T>>A)+b]=I<<24|B<<16|N|0}while(0!==b);for(w=1<<p-1;T&w;)w>>=1;if(0!==w?(T&=w-1,T+=w):T=0,v++,0==--U[p]){if(p===y)break;p=t[i+c[v]]}if(p>E&&(T&k)!==m){for(0===A&&(A=E),_+=x,R=p-A,Z=1<<R;R+A<y&&(Z-=U[R+A],!(Z<=0));)R++,Z<<=1;if(S+=1<<R,1===e&&S>852||2===e&&S>592)return 1;m=T&k,a[m]=E<<24|R<<16|_-r|0}}return 0!==T&&(a[_+T]=p-A<<24|64<<16|0),h.bits=E,0},h={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};const{Z_FINISH:u,Z_BLOCK:w,Z_TREES:b,Z_OK:m,Z_STREAM_END:k,Z_NEED_DICT:_,Z_STREAM_ERROR:g,Z_DATA_ERROR:p,Z_MEM_ERROR:v,Z_BUF_ERROR:x,Z_DEFLATED:y}=h,E=16180,R=16190,A=16191,Z=16192,S=16194,T=16199,O=16200,U=16206,D=16209,I=e=>(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24);function B(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const N=e=>{if(!e)return 1;const t=e.state;return!t||t.strm!==e||t.mode<E||t.mode>16211?1:0},C=e=>{if(N(e))return g;const t=e.state;return e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=E,t.last=0,t.havedict=0,t.flags=-1,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new Int32Array(852),t.distcode=t.distdyn=new Int32Array(592),t.sane=1,t.back=-1,m},z=e=>{if(N(e))return g;const t=e.state;return t.wsize=0,t.whave=0,t.wnext=0,C(e)},F=(e,t)=>{let i;if(N(e))return g;const n=e.state;return t<0?(i=0,t=-t):(i=5+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?g:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=i,n.wbits=t,z(e))},L=(e,t)=>{if(!e)return g;const i=new B;e.state=i,i.strm=e,i.window=null,i.mode=E;const n=F(e,t);return n!==m&&(e.state=null),n};let M,H,j=!0;const K=e=>{if(j){M=new Int32Array(512),H=new Int32Array(32);let t=0;for(;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(c(1,e.lens,0,288,M,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;c(2,e.lens,0,32,H,0,e.work,{bits:5}),j=!1}e.lencode=M,e.lenbits=9,e.distcode=H,e.distbits=5},P=(e,t,i,n)=>{let a;const r=e.state;return null===r.window&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new Uint8Array(r.wsize)),n>=r.wsize?(r.window.set(t.subarray(i-r.wsize,i),0),r.wnext=0,r.whave=r.wsize):(a=r.wsize-r.wnext,a>n&&(a=n),r.window.set(t.subarray(i-n,i-n+a),r.wnext),(n-=a)?(r.window.set(t.subarray(i-n,i),0),r.wnext=n,r.whave=r.wsize):(r.wnext+=a,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=a))),0};var Y={inflateReset:z,inflateReset2:F,inflateResetKeep:C,inflateInit:e=>L(e,15),inflateInit2:L,inflate:(e,i)=>{let a,o,s,l,d,f,h,B,C,z,F,L,M,H,j,Y,G,X,W,q,J,Q,V=0;const $=new Uint8Array(4);let ee,te;const ie=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(N(e)||!e.output||!e.input&&0!==e.avail_in)return g;a=e.state,a.mode===A&&(a.mode=Z),d=e.next_out,s=e.output,h=e.avail_out,l=e.next_in,o=e.input,f=e.avail_in,B=a.hold,C=a.bits,z=f,F=h,Q=m;e:for(;;)switch(a.mode){case E:if(0===a.wrap){a.mode=Z;break}for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(2&a.wrap&&35615===B){0===a.wbits&&(a.wbits=15),a.check=0,$[0]=255&B,$[1]=B>>>8&255,a.check=n(a.check,$,2,0),B=0,C=0,a.mode=16181;break}if(a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&B)<<8)+(B>>8))%31){e.msg="incorrect header check",a.mode=D;break}if((15&B)!==y){e.msg="unknown compression method",a.mode=D;break}if(B>>>=4,C-=4,J=8+(15&B),0===a.wbits&&(a.wbits=J),J>15||J>a.wbits){e.msg="invalid window size",a.mode=D;break}a.dmax=1<<a.wbits,a.flags=0,e.adler=a.check=1,a.mode=512&B?16189:A,B=0,C=0;break;case 16181:for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(a.flags=B,(255&a.flags)!==y){e.msg="unknown compression method",a.mode=D;break}if(57344&a.flags){e.msg="unknown header flags set",a.mode=D;break}a.head&&(a.head.text=B>>8&1),512&a.flags&&4&a.wrap&&($[0]=255&B,$[1]=B>>>8&255,a.check=n(a.check,$,2,0)),B=0,C=0,a.mode=16182;case 16182:for(;C<32;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.head&&(a.head.time=B),512&a.flags&&4&a.wrap&&($[0]=255&B,$[1]=B>>>8&255,$[2]=B>>>16&255,$[3]=B>>>24&255,a.check=n(a.check,$,4,0)),B=0,C=0,a.mode=16183;case 16183:for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.head&&(a.head.xflags=255&B,a.head.os=B>>8),512&a.flags&&4&a.wrap&&($[0]=255&B,$[1]=B>>>8&255,a.check=n(a.check,$,2,0)),B=0,C=0,a.mode=16184;case 16184:if(1024&a.flags){for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.length=B,a.head&&(a.head.extra_len=B),512&a.flags&&4&a.wrap&&($[0]=255&B,$[1]=B>>>8&255,a.check=n(a.check,$,2,0)),B=0,C=0}else a.head&&(a.head.extra=null);a.mode=16185;case 16185:if(1024&a.flags&&(L=a.length,L>f&&(L=f),L&&(a.head&&(J=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Uint8Array(a.head.extra_len)),a.head.extra.set(o.subarray(l,l+L),J)),512&a.flags&&4&a.wrap&&(a.check=n(a.check,o,L,l)),f-=L,l+=L,a.length-=L),a.length))break e;a.length=0,a.mode=16186;case 16186:if(2048&a.flags){if(0===f)break e;L=0;do{J=o[l+L++],a.head&&J&&a.length<65536&&(a.head.name+=String.fromCharCode(J))}while(J&&L<f);if(512&a.flags&&4&a.wrap&&(a.check=n(a.check,o,L,l)),f-=L,l+=L,J)break e}else a.head&&(a.head.name=null);a.length=0,a.mode=16187;case 16187:if(4096&a.flags){if(0===f)break e;L=0;do{J=o[l+L++],a.head&&J&&a.length<65536&&(a.head.comment+=String.fromCharCode(J))}while(J&&L<f);if(512&a.flags&&4&a.wrap&&(a.check=n(a.check,o,L,l)),f-=L,l+=L,J)break e}else a.head&&(a.head.comment=null);a.mode=16188;case 16188:if(512&a.flags){for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(4&a.wrap&&B!==(65535&a.check)){e.msg="header crc mismatch",a.mode=D;break}B=0,C=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),e.adler=a.check=0,a.mode=A;break;case 16189:for(;C<32;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}e.adler=a.check=I(B),B=0,C=0,a.mode=R;case R:if(0===a.havedict)return e.next_out=d,e.avail_out=h,e.next_in=l,e.avail_in=f,a.hold=B,a.bits=C,_;e.adler=a.check=1,a.mode=A;case A:if(i===w||i===b)break e;case Z:if(a.last){B>>>=7&C,C-=7&C,a.mode=U;break}for(;C<3;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}switch(a.last=1&B,B>>>=1,C-=1,3&B){case 0:a.mode=16193;break;case 1:if(K(a),a.mode=T,i===b){B>>>=2,C-=2;break e}break;case 2:a.mode=16196;break;case 3:e.msg="invalid block type",a.mode=D}B>>>=2,C-=2;break;case 16193:for(B>>>=7&C,C-=7&C;C<32;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if((65535&B)!=(B>>>16^65535)){e.msg="invalid stored block lengths",a.mode=D;break}if(a.length=65535&B,B=0,C=0,a.mode=S,i===b)break e;case S:a.mode=16195;case 16195:if(L=a.length,L){if(L>f&&(L=f),L>h&&(L=h),0===L)break e;s.set(o.subarray(l,l+L),d),f-=L,l+=L,h-=L,d+=L,a.length-=L;break}a.mode=A;break;case 16196:for(;C<14;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(a.nlen=257+(31&B),B>>>=5,C-=5,a.ndist=1+(31&B),B>>>=5,C-=5,a.ncode=4+(15&B),B>>>=4,C-=4,a.nlen>286||a.ndist>30){e.msg="too many length or distance symbols",a.mode=D;break}a.have=0,a.mode=16197;case 16197:for(;a.have<a.ncode;){for(;C<3;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.lens[ie[a.have++]]=7&B,B>>>=3,C-=3}for(;a.have<19;)a.lens[ie[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,ee={bits:a.lenbits},Q=c(0,a.lens,0,19,a.lencode,0,a.work,ee),a.lenbits=ee.bits,Q){e.msg="invalid code lengths set",a.mode=D;break}a.have=0,a.mode=16198;case 16198:for(;a.have<a.nlen+a.ndist;){for(;V=a.lencode[B&(1<<a.lenbits)-1],j=V>>>24,Y=V>>>16&255,G=65535&V,!(j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(G<16)B>>>=j,C-=j,a.lens[a.have++]=G;else{if(16===G){for(te=j+2;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(B>>>=j,C-=j,0===a.have){e.msg="invalid bit length repeat",a.mode=D;break}J=a.lens[a.have-1],L=3+(3&B),B>>>=2,C-=2}else if(17===G){for(te=j+3;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}B>>>=j,C-=j,J=0,L=3+(7&B),B>>>=3,C-=3}else{for(te=j+7;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}B>>>=j,C-=j,J=0,L=11+(127&B),B>>>=7,C-=7}if(a.have+L>a.nlen+a.ndist){e.msg="invalid bit length repeat",a.mode=D;break}for(;L--;)a.lens[a.have++]=J}}if(a.mode===D)break;if(0===a.lens[256]){e.msg="invalid code -- missing end-of-block",a.mode=D;break}if(a.lenbits=9,ee={bits:a.lenbits},Q=c(1,a.lens,0,a.nlen,a.lencode,0,a.work,ee),a.lenbits=ee.bits,Q){e.msg="invalid literal/lengths set",a.mode=D;break}if(a.distbits=6,a.distcode=a.distdyn,ee={bits:a.distbits},Q=c(2,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,ee),a.distbits=ee.bits,Q){e.msg="invalid distances set",a.mode=D;break}if(a.mode=T,i===b)break e;case T:a.mode=O;case O:if(f>=6&&h>=258){e.next_out=d,e.avail_out=h,e.next_in=l,e.avail_in=f,a.hold=B,a.bits=C,r(e,F),d=e.next_out,s=e.output,h=e.avail_out,l=e.next_in,o=e.input,f=e.avail_in,B=a.hold,C=a.bits,a.mode===A&&(a.back=-1);break}for(a.back=0;V=a.lencode[B&(1<<a.lenbits)-1],j=V>>>24,Y=V>>>16&255,G=65535&V,!(j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(Y&&0==(240&Y)){for(X=j,W=Y,q=G;V=a.lencode[q+((B&(1<<X+W)-1)>>X)],j=V>>>24,Y=V>>>16&255,G=65535&V,!(X+j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}B>>>=X,C-=X,a.back+=X}if(B>>>=j,C-=j,a.back+=j,a.length=G,0===Y){a.mode=16205;break}if(32&Y){a.back=-1,a.mode=A;break}if(64&Y){e.msg="invalid literal/length code",a.mode=D;break}a.extra=15&Y,a.mode=16201;case 16201:if(a.extra){for(te=a.extra;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.length+=B&(1<<a.extra)-1,B>>>=a.extra,C-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=16202;case 16202:for(;V=a.distcode[B&(1<<a.distbits)-1],j=V>>>24,Y=V>>>16&255,G=65535&V,!(j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(0==(240&Y)){for(X=j,W=Y,q=G;V=a.distcode[q+((B&(1<<X+W)-1)>>X)],j=V>>>24,Y=V>>>16&255,G=65535&V,!(X+j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}B>>>=X,C-=X,a.back+=X}if(B>>>=j,C-=j,a.back+=j,64&Y){e.msg="invalid distance code",a.mode=D;break}a.offset=G,a.extra=15&Y,a.mode=16203;case 16203:if(a.extra){for(te=a.extra;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.offset+=B&(1<<a.extra)-1,B>>>=a.extra,C-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){e.msg="invalid distance too far back",a.mode=D;break}a.mode=16204;case 16204:if(0===h)break e;if(L=F-h,a.offset>L){if(L=a.offset-L,L>a.whave&&a.sane){e.msg="invalid distance too far back",a.mode=D;break}L>a.wnext?(L-=a.wnext,M=a.wsize-L):M=a.wnext-L,L>a.length&&(L=a.length),H=a.window}else H=s,M=d-a.offset,L=a.length;L>h&&(L=h),h-=L,a.length-=L;do{s[d++]=H[M++]}while(--L);0===a.length&&(a.mode=O);break;case 16205:if(0===h)break e;s[d++]=a.length,h--,a.mode=O;break;case U:if(a.wrap){for(;C<32;){if(0===f)break e;f--,B|=o[l++]<<C,C+=8}if(F-=h,e.total_out+=F,a.total+=F,4&a.wrap&&F&&(e.adler=a.check=a.flags?n(a.check,s,F,d-F):t(a.check,s,F,d-F)),F=h,4&a.wrap&&(a.flags?B:I(B))!==a.check){e.msg="incorrect data check",a.mode=D;break}B=0,C=0}a.mode=16207;case 16207:if(a.wrap&&a.flags){for(;C<32;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(4&a.wrap&&B!==(4294967295&a.total)){e.msg="incorrect length check",a.mode=D;break}B=0,C=0}a.mode=16208;case 16208:Q=k;break e;case D:Q=p;break e;case 16210:return v;default:return g}return e.next_out=d,e.avail_out=h,e.next_in=l,e.avail_in=f,a.hold=B,a.bits=C,(a.wsize||F!==e.avail_out&&a.mode<D&&(a.mode<U||i!==u))&&P(e,e.output,e.next_out,F-e.avail_out),z-=e.avail_in,F-=e.avail_out,e.total_in+=z,e.total_out+=F,a.total+=F,4&a.wrap&&F&&(e.adler=a.check=a.flags?n(a.check,s,F,e.next_out-F):t(a.check,s,F,e.next_out-F)),e.data_type=a.bits+(a.last?64:0)+(a.mode===A?128:0)+(a.mode===T||a.mode===S?256:0),(0===z&&0===F||i===u)&&Q===m&&(Q=x),Q},inflateEnd:e=>{if(N(e))return g;let t=e.state;return t.window&&(t.window=null),e.state=null,m},inflateGetHeader:(e,t)=>{if(N(e))return g;const i=e.state;return 0==(2&i.wrap)?g:(i.head=t,t.done=!1,m)},inflateSetDictionary:(e,i)=>{const n=i.length;let a,r,o;return N(e)?g:(a=e.state,0!==a.wrap&&a.mode!==R?g:a.mode===R&&(r=1,r=t(r,i,n,0),r!==a.check)?p:(o=P(e,i,n,n),o?(a.mode=16210,v):(a.havedict=1,m)))},inflateInfo:"pako inflate (from Nodeca project)"};const G=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var X=function(e){const t=Array.prototype.slice.call(arguments,1);for(;t.length;){const i=t.shift();if(i){if("object"!=typeof i)throw new TypeError(i+"must be non-object");for(const t in i)G(i,t)&&(e[t]=i[t])}}return e},W=e=>{let t=0;for(let i=0,n=e.length;i<n;i++)t+=e[i].length;const i=new Uint8Array(t);for(let t=0,n=0,a=e.length;t<a;t++){let a=e[t];i.set(a,n),n+=a.length}return i};let q=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){q=!1}const J=new Uint8Array(256);for(let e=0;e<256;e++)J[e]=e>=252?6:e>=248?5:e>=240?4:e>=224?3:e>=192?2:1;J[254]=J[254]=1;var Q=e=>{if("function"==typeof TextEncoder&&TextEncoder.prototype.encode)return(new TextEncoder).encode(e);let t,i,n,a,r,o=e.length,s=0;for(a=0;a<o;a++)i=e.charCodeAt(a),55296==(64512&i)&&a+1<o&&(n=e.charCodeAt(a+1),56320==(64512&n)&&(i=65536+(i-55296<<10)+(n-56320),a++)),s+=i<128?1:i<2048?2:i<65536?3:4;for(t=new Uint8Array(s),r=0,a=0;r<s;a++)i=e.charCodeAt(a),55296==(64512&i)&&a+1<o&&(n=e.charCodeAt(a+1),56320==(64512&n)&&(i=65536+(i-55296<<10)+(n-56320),a++)),i<128?t[r++]=i:i<2048?(t[r++]=192|i>>>6,t[r++]=128|63&i):i<65536?(t[r++]=224|i>>>12,t[r++]=128|i>>>6&63,t[r++]=128|63&i):(t[r++]=240|i>>>18,t[r++]=128|i>>>12&63,t[r++]=128|i>>>6&63,t[r++]=128|63&i);return t},V=(e,t)=>{const i=t||e.length;if("function"==typeof TextDecoder&&TextDecoder.prototype.decode)return(new TextDecoder).decode(e.subarray(0,t));let n,a;const r=new Array(2*i);for(a=0,n=0;n<i;){let t=e[n++];if(t<128){r[a++]=t;continue}let o=J[t];if(o>4)r[a++]=65533,n+=o-1;else{for(t&=2===o?31:3===o?15:7;o>1&&n<i;)t=t<<6|63&e[n++],o--;o>1?r[a++]=65533:t<65536?r[a++]=t:(t-=65536,r[a++]=55296|t>>10&1023,r[a++]=56320|1023&t)}}return((e,t)=>{if(t<65534&&e.subarray&&q)return String.fromCharCode.apply(null,e.length===t?e:e.subarray(0,t));let i="";for(let n=0;n<t;n++)i+=String.fromCharCode(e[n]);return i})(r,a)},$=(e,t)=>{(t=t||e.length)>e.length&&(t=e.length);let i=t-1;for(;i>=0&&128==(192&e[i]);)i--;return i<0||0===i?t:i+J[e[i]]>t?i:t},ee={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"};var te=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0};var ie=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1};const ne=Object.prototype.toString,{Z_NO_FLUSH:ae,Z_FINISH:re,Z_OK:oe,Z_STREAM_END:se,Z_NEED_DICT:le,Z_STREAM_ERROR:de,Z_DATA_ERROR:fe,Z_MEM_ERROR:ce}=h;function he(e){this.options=X({chunkSize:65536,windowBits:15,to:""},e||{});const t=this.options;t.raw&&t.windowBits>=0&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(t.windowBits>=0&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),t.windowBits>15&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new te,this.strm.avail_out=0;let i=Y.inflateInit2(this.strm,t.windowBits);if(i!==oe)throw new Error(ee[i]);if(this.header=new ie,Y.inflateGetHeader(this.strm,this.header),t.dictionary&&("string"==typeof t.dictionary?t.dictionary=Q(t.dictionary):"[object ArrayBuffer]"===ne.call(t.dictionary)&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(i=Y.inflateSetDictionary(this.strm,t.dictionary),i!==oe)))throw new Error(ee[i])}function ue(e,t){const i=new he(t);if(i.push(e),i.err)throw i.msg||ee[i.err];return i.result}he.prototype.push=function(e,t){const i=this.strm,n=this.options.chunkSize,a=this.options.dictionary;let r,o,s;if(this.ended)return!1;for(o=t===~~t?t:!0===t?re:ae,"[object ArrayBuffer]"===ne.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;;){for(0===i.avail_out&&(i.output=new Uint8Array(n),i.next_out=0,i.avail_out=n),r=Y.inflate(i,o),r===le&&a&&(r=Y.inflateSetDictionary(i,a),r===oe?r=Y.inflate(i,o):r===fe&&(r=le));i.avail_in>0&&r===se&&i.state.wrap>0&&0!==e[i.next_in];)Y.inflateReset(i),r=Y.inflate(i,o);switch(r){case de:case fe:case le:case ce:return this.onEnd(r),this.ended=!0,!1}if(s=i.avail_out,i.next_out&&(0===i.avail_out||r===se))if("string"===this.options.to){let e=$(i.output,i.next_out),t=i.next_out-e,a=V(i.output,e);i.next_out=t,i.avail_out=n-t,t&&i.output.set(i.output.subarray(e,e+t),0),this.onData(a)}else this.onData(i.output.length===i.next_out?i.output:i.output.subarray(0,i.next_out));if(r!==oe||0!==s){if(r===se)return r=Y.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,!0;if(0===i.avail_in)break}}return!0},he.prototype.onData=function(e){this.chunks.push(e)},he.prototype.onEnd=function(e){e===oe&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=W(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};var we=he,be=ue,me=function(e,t){return(t=t||{}).raw=!0,ue(e,t)},ke=ue,_e=h,ge={Inflate:we,inflate:be,inflateRaw:me,ungzip:ke,constants:_e};e.Inflate=we,e.constants=_e,e.default=ge,e.inflate=be,e.inflateRaw=me,e.ungzip=ke,Object.defineProperty(e,"__esModule",{value:!0})}));
`;var Ch=Object.getOwnPropertyDescriptor,Ph=(e,i,t,r)=>{for(var n=r>1?void 0:r?Ch(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let Kr=class{constructor(){}async pack(e){const i=e.name.replace(/\.html?$/i,""),t=await e.text(),r=Yr.deflate(t),n=this._arrayBufferToBase64(r),a='<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+i+" (Packed)</title></head><body><script>"+Eh+`<\/script><script>// Loader logic
const b64 = "`+n+`";
function b64ToUint8Array(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
(function() {
  const compressed = b64ToUint8Array(b64);
  const html = window.pako.inflate(compressed, { to: 'string' });
  document.open();
  document.write(html);
  document.close();
})();
<\/script></body></html>`;return{fileName:`${i}-packed.html`,html:a}}_arrayBufferToBase64(e){let i="";const t=new Uint8Array(e),r=t.byteLength;for(let n=0;n<r;n++)i+=String.fromCharCode(t[n]);return btoa(i)}};Kr=Ph([vi()],Kr);var Th=Object.defineProperty,Rh=Object.getOwnPropertyDescriptor,Gs=(e,i,t,r)=>{for(var n=r>1?void 0:r?Rh(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&Th(i,t,n),n};let Xr=class extends ge{constructor(){super(...arguments),this.dragActive=!1,this.loadedFile=null,this.packedFileName=null,this.packedHtml=null,this.packedSize=null,this.compressionInfo=null,this._downloadPacked=()=>{if(!this.packedHtml||!this.packedFileName)return;const e=new Blob([this.packedHtml],{type:"text/html"}),i=URL.createObjectURL(e),t=document.createElement("a");t.href=i,t.download=this.packedFileName,document.body.appendChild(t),t.click(),setTimeout(()=>{document.body.removeChild(t),URL.revokeObjectURL(i)},100)}}render(){return U`
      <div class="imba-packer-page">
        <div style="margin-bottom:1.5rem">
          <strong>Imba Packer (Experimental)</strong><br />
          <div style="margin: 0.5em 0 1em 0; font-size: 0.97em; color: #555;">
            Imba Packer optimizes and compresses HTML files for playable ads and similar use cases.<br />
            <ul style="margin:0.5em 0 0.5em 1.2em; padding:0;">
              <li>Upload or drop an HTML file below.</li>
              <li>The file will be processed and minified to reduce its size.</li>
              <li>Download the packed HTML and view compression statistics.</li>
              <li>All original functionality is preserved as much as possible.</li>
            </ul>
            <span style="color:#a00">Experimental: results may vary depending on input file.</span>
          </div>
          <small>
            Drop your file below or select it manually.
          </small>
        </div>
        ${this.loadedFile?U`
              <div class="file-loaded-info">
                <strong>File loaded:</strong> ${this.loadedFile.name}
                (${(this.loadedFile.size/1024).toFixed(2)} KB)
                <button style="margin-left:1em" @click=${this._resetFile}>Cancel</button>
              </div>
              ${this.packedFileName&&this.packedHtml&&this.packedSize&&this.compressionInfo?U`
                <div class="packed-info" style="margin-top:1em;">
                  <div><strong>Packed file:</strong> ${this.packedFileName}</div>
                  <div><strong>Original size:</strong> ${(this.loadedFile.size/1024).toFixed(2)} KB</div>
                  <div><strong>Packed size:</strong> ${(this.packedSize/1024).toFixed(2)} KB</div>
                  <div><strong>Difference:</strong> ${(this.compressionInfo.diff/1024).toFixed(2)} KB</div>
                  <div><strong>Compression rate:</strong> ${this.compressionInfo.percent.toFixed(1)}%</div>
                  <button style="margin-top:0.7em" @click=${this._downloadPacked}>Download packed file</button>
                </div>
              `:U`<div style="margin-top:1em;">Packing...</div>`}
            `:U`
              <div
                class="dropzone ${this.dragActive?"dragover":""}"
                @dragover=${this._onDragOver}
                @dragleave=${this._onDragLeave}
                @drop=${this._onDrop}
              >
                <p>Drop your file here or</p>
                <label class="file-select-button">
                  Select file
                  <input
                    type="file"
                    @change=${this._onFileChange}
                  />
                </label>
              </div>
            `}
      </div>
    `}_onDragOver(e){e.preventDefault(),this.dragActive=!0,this.requestUpdate()}_onDragLeave(e){e.preventDefault(),this.dragActive=!1,this.requestUpdate()}_onDrop(e){e.preventDefault(),this.dragActive=!1,this.requestUpdate();const i=e.dataTransfer?.files;i&&i.length&&this._processFile(i[0])}_onFileChange(e){const t=e.target.files?.[0];t&&this._processFile(t)}async _processFile(e){if(!e.name.match(/\.html?$/i)){alert("Please select a valid .html file.");return}this.loadedFile=e,this.packedFileName=null,this.packedHtml=null,this.packedSize=null,this.compressionInfo=null,this.requestUpdate();try{const{fileName:t,html:r}=await this.imbaPackerService.pack(e);this.packedFileName=t,this.packedHtml=r,this.packedSize=new Blob([r],{type:"text/html"}).size;const n=this.loadedFile.size-this.packedSize,a=n/this.loadedFile.size*100;this.compressionInfo={diff:n,percent:a},this.requestUpdate()}catch(t){alert("Packing failed: "+(t instanceof Error?t.message:t))}const i=new CustomEvent("file-selected",{detail:e});this.dispatchEvent(i)}_resetFile(){this.loadedFile=null,this.packedFileName=null,this.packedHtml=null,this.packedSize=null,this.compressionInfo=null,this.requestUpdate()}};Gs([Mt(Kr)],Xr.prototype,"imbaPackerService",2);Xr=Gs([we("imba-packer-page"),Ke("/imba-packer")],Xr);var Uh=Object.getOwnPropertyDescriptor,Oh=(e,i,t,r)=>{for(var n=r>1?void 0:r?Uh(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let Jr=class{constructor(){this.githubToken=null}setGithubToken(e){this.githubToken=e}async getPlayables(e){return this.githubToken,["Playable 1 (stub)","Playable 2 (stub)","Playable 3 (stub)"]}};Jr=Oh([vi(mt.Singleton)],Jr);var Dh=Object.defineProperty,Ih=Object.getOwnPropertyDescriptor,Ws=(e,i,t,r)=>{for(var n=r>1?void 0:r?Ih(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&Dh(i,t,n),n};let Qr=class extends ge{constructor(){super(...arguments),this.repoUrl="",this.playables=[],this.githubTokenInput="",this.handleTokenInput=e=>{this.githubTokenInput=e.target.value},this.saveGithubToken=()=>{this.githubTokenInput&&(localStorage.setItem("portfolio-github-token",this.githubTokenInput),this.portfolioService.setGithubToken(this.githubTokenInput),this.githubTokenInput="",this.requestUpdate())}}connectedCallback(){super.connectedCallback();const e=localStorage.getItem("portfolio-repo-url");e&&(this.repoUrl=e,this.loadPlayables())}handleInput(e){this.repoUrl=e.target.value,this.requestUpdate()}saveRepoUrl(){localStorage.setItem("portfolio-repo-url",this.repoUrl),this.loadPlayables()}async loadPlayables(){this.repoUrl&&(this.playables=await this.portfolioService.getPlayables(this.repoUrl),this.requestUpdate())}render(){return U`
      <div class="portfolio-container">
        <section style="margin-bottom: 1.5em;">
          <h3>GitHub Token Setup</h3>
          <p>
            To access your repository, you need a GitHub <b>Personal Access Token</b> with <code>public_repo</code> scope.<br />
            <a href="https://github.com/settings/tokens/new?scopes=public_repo&description=PlayableTools" target="_blank" rel="noopener">Generate a token here</a>.<br />
            <b>Keep your token secure!</b> It will be stored in your browser's local storage.
          </p>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1em;">
            <label for="github-token-input" style="margin-right: 8px;">GitHub Token:</label>
          <input id="github-token-input" type="password" placeholder="ghp_..." style="width: 300px;" @input=${this.handleTokenInput} />
          <button @click=${this.saveGithubToken}>Save Token</button>
          </div>
        </section>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1em;">
          <label for="repo-url-input" style="margin-right: 8px;">GitHub Repository URL:</label>
          <input id="repo-url-input" type="text" .value=${this.repoUrl} @input=${this.handleInput} placeholder="https://github.com/user/repo" style="width: 400px;" />
          <button @click=${this.saveRepoUrl}>Save</button>
        </div>
        <div class="playables-list">
          <h3>Playable Ads:</h3>
          <ul>
            ${this.playables.length===0?U`<li>No playables found.</li>`:this.playables.map(e=>U`<li>${e}</li>`)}
          </ul>
        </div>
      </div>
    `}};Ws([Mt(Jr)],Qr.prototype,"portfolioService",2);Qr=Ws([we("portfolio-page"),Ke("/portfolio",{title:"Portfolio | PlayableTools",description:"Manage and view your portfolio of playable ads from a GitHub repository."})],Qr);const Mh=[{id:"default",name:"Default Preview",description:"Standard preview without any ad network validation",maxFileSizeMB:10,injectScripts:[],replaceTokens:{}},{id:"facebook",name:"Facebook Validator",description:"Facebook ad network validation with content security policies",maxFileSizeMB:5,injectScripts:[{source:"/fb_validator.js",position:"beforeHeadEnd"}],replaceTokens:{XMLHttpRequest:"_xrq_"}},{id:"mraid",name:"MRAID Preview",description:"Preview configured for MRAID playables. Useful when testing playables targeted to ad networks that use MRAID (examples: Unity, IronSource, AppLovin, Vungle, Mintegral, MoPub). Injects mraid.js where appropriate and preserves MRAID API behavior when available.",maxFileSizeMB:10,injectScripts:[{source:"/mraid.js",position:"beforeHeadEnd"}],replaceTokens:{}}],zh={presets:Mh};class Lh{validate(i,t){return{categories:[{name:"General",checks:[{name:'Not using "window.top" access',passed:!i.includes("window.top")&&!i.includes("top."),details:i.includes("window.top")||i.includes("top.")?"Playable contains window.top access which may cause issues in ad environments":void 0},{name:"No external script loading",passed:!/<script[^>]*src\s*=\s*["'][^"']*["'][^>]*>/.test(i),details:/<script[^>]*src\s*=\s*["'][^"']*["'][^>]*>/.test(i)?"External scripts detected - consider bundling all scripts":void 0},{name:"Valid HTML structure",passed:/<html[^>]*>[\s\S]*<\/html>/i.test(i),details:/<html[^>]*>[\s\S]*<\/html>/i.test(i)?void 0:"Missing proper HTML structure"}]}]}}}class Bh{validate(i,t){return{categories:[{name:"Facebook",checks:[{name:"HTML file size < 5MB",passed:t<=5242880,details:t>5242880?`File size: ${(t/1048576).toFixed(1)}MB (max: 5MB)`:`File size: ${(t/1048576).toFixed(1)}MB`},{name:"No XMLHttpRequest usage",passed:!i.includes("XMLHttpRequest")&&!i.includes("fetch("),details:i.includes("XMLHttpRequest")||i.includes("fetch(")?"XMLHttpRequest/fetch usage detected - Facebook blocks these APIs":void 0},{name:"No localStorage/sessionStorage",passed:!i.includes("localStorage")&&!i.includes("sessionStorage"),details:i.includes("localStorage")||i.includes("sessionStorage")?"localStorage/sessionStorage usage detected - may not work in Facebook environment":void 0},{name:"Valid HTML5 doctype",passed:/<!DOCTYPE html>/i.test(i),details:/<!DOCTYPE html>/i.test(i)?void 0:"Missing HTML5 doctype declaration"}]}]}}}class Fh{validate(i,t){return{categories:[{name:"MRAID",checks:[{name:"HTML file size < 5MB",passed:t<=5242880,details:t>5242880?`File size: ${(t/1048576).toFixed(1)}MB (max: 5MB)`:`File size: ${(t/1048576).toFixed(1)}MB`},{name:"MRAID script included",passed:i.includes("mraid.js")||i.includes("/mraid.js"),details:!i.includes("mraid.js")&&!i.includes("/mraid.js")?"MRAID script not found in HTML":void 0},{name:"viewableChange handler present",passed:i.includes("viewableChange")||i.includes("mraid.addEventListener"),details:!i.includes("viewableChange")&&!i.includes("mraid.addEventListener")?"No viewableChange event handler found":void 0},{name:"MRAID ready event handled",passed:i.includes("mraid.addEventListener")&&i.includes("ready"),details:i.includes("mraid.addEventListener")&&i.includes("ready")?void 0:"MRAID ready event handler not found"},{name:"No direct DOM manipulation without MRAID",passed:!i.includes("document.body")||i.includes("mraid"),details:i.includes("document.body")&&!i.includes("mraid")?"Direct body manipulation detected - use MRAID APIs instead":void 0}]}]}}}var Nh=Object.getOwnPropertyDescriptor,Zh=(e,i,t,r)=>{for(var n=r>1?void 0:r?Nh(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let rr=class{constructor(){this._uploadedContent=null,this._uploadedListeners=new Set,this._originalUploadedContent=null,this._originalGithubContent=null,this._currentPreset=null,this._presetListeners=new Set,this._presetsConfig=zh,this._validationResults=null,this._validationListeners=new Set}getShareableLink(e,i,t){const r=new URLSearchParams({adId:e,size:i,orientation:t});return`${window.location.origin}/preview?${r.toString()}`}encodeUrl(e){const i=Yr.deflate(e),t=String.fromCharCode(...Array.from(i));return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}decodeUrl(e){let i=e.replace(/-/g,"+").replace(/_/g,"/");for(;i.length%4;)i+="=";const t=atob(i),r=new Uint8Array([...t].map(n=>n.charCodeAt(0)));try{return Yr.inflate(r,{to:"string"})}catch(n){return String(n)}}githubToRawUrl(e){const i=e.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);if(!i)return null;const[,t,r,n,a]=i;return`https://raw.githubusercontent.com/${t}/${r}/refs/heads/${n}/${a}`}async fetchRawContent(e){const i=await fetch(e);if(!i.ok)throw new Error(`Failed to fetch: ${i.status}`);const t=await i.text();this._originalGithubContent=t;const r=await this.processContentWithPreset(t),n=new Blob([r]).size;return await this.runValidation(r,n),r}setUploadedContent(e){this._uploadedContent=e;for(const i of Array.from(this._uploadedListeners))i(e)}getUploadedContent(){return this._uploadedContent}onUploadedContentChange(e){return this._uploadedListeners.add(e),()=>this._uploadedListeners.delete(e)}getAvailablePresets(){return this._presetsConfig.presets}getDefaultPreset(){return this._presetsConfig.presets[0]}getPresetById(e){return this._presetsConfig.presets.find(i=>i.id===e)||null}setCurrentPreset(e){const i=this._currentPreset?.name||"none";console.log(`🔄 PreviewService: Changing preset from "${i}" to "${e?.name||"none"}"`),this._currentPreset=e;for(const t of Array.from(this._presetListeners))t(e);console.log(`✅ PreviewService: Preset change completed, notified ${this._presetListeners.size} listeners`)}getCurrentPreset(){return this._currentPreset||this.getDefaultPreset()}onPresetChange(e){return this._presetListeners.add(e),()=>this._presetListeners.delete(e)}async processContentWithPreset(e,i){const t=i||this.getCurrentPreset();if(!t)return e;console.log("Processing content with preset:",t.name);let r=e;for(const[n,a]of Object.entries(t.replaceTokens)){const o=new RegExp(n,"g"),l=r.match(o);l&&(console.log(`Replacing ${l.length} occurrences of "${n}" with "${a}"`),r=r.replace(o,a))}for(const n of t.injectScripts)try{console.log(`📜 Injecting script from ${n.source} at position ${n.position}`);const a=performance.now(),o=await this.loadScriptContent(n.source),l=performance.now()-a;console.log(`📥 Script loaded in ${l.toFixed(2)}ms (${o.length} chars)`),r=this.injectScript(r,o,n.position);const u=performance.now()-a;console.log(`✅ Script injection completed in ${u.toFixed(2)}ms`)}catch(a){console.warn(`❌ Failed to inject script ${n.source}:`,a)}return r}async loadScriptContent(e){const i=e.startsWith("/")?`${window.location.origin}${e}`:e;console.log(`Loading script from: ${i}`);const t=await fetch(i);if(!t.ok)throw new Error(`Failed to load script: ${t.status} ${t.statusText}`);return await t.text()}injectScript(e,i,t){const r=`<script>
${i}
<\/script>`;switch(t){case"beforeHeadEnd":return e.replace(/<\/head>/i,`${r}
</head>`);case"afterBodyStart":return e.replace(/<body[^>]*>/i,n=>`${n}
${r}`);case"beforeBodyEnd":return e.replace(/<\/body>/i,`${r}
</body>`);default:return console.warn(`Unknown script injection position: ${t}`),e}}async handleFileUpload(e){const i=this.getCurrentPreset();if(!this.isValidHtmlFile(e))throw new Error("Please select a valid HTML file (.html, .htm)");const t=i?.maxFileSizeMB||10,r=t*1024*1024;if(e.size>r)throw new Error(`File size must be less than ${t}MB (${i?.name||"current preset"} limit)`);try{const n=await this.readFileAsText(e);if(!this.isValidHtmlContent(n))throw new Error("The file does not appear to contain valid HTML content");this._originalUploadedContent=n,this._originalGithubContent=null;const a=await this.processContentWithPreset(n,i||void 0);return await this.runValidation(a,e.size),this.setUploadedContent(a),a}catch(n){throw n instanceof Error?n:new Error("Failed to read the uploaded file")}}isValidHtmlFile(e){const i=[".html",".htm"],t=e.name.toLowerCase();return i.some(r=>t.endsWith(r))}readFileAsText(e){return new Promise((i,t)=>{const r=new FileReader;r.onload=n=>{const a=n.target?.result;typeof a=="string"?i(a):t(new Error("Failed to read file as text"))},r.onerror=()=>{t(new Error("Error reading file"))},r.readAsText(e,"UTF-8")})}isValidHtmlContent(e){const i=e.trim();return i.length===0?!1:/<html|<!DOCTYPE|<head|<body|<div|<script|<style/i.test(i)}clearUploadedContent(){this.setUploadedContent(null),this._originalUploadedContent=null,this._originalGithubContent=null,console.log("🧹 Cleared all content (processed and original)")}async reloadContentWithPreset(e){if(console.log(`🔄 Reloading content with preset: ${e.name}`),this.setCurrentPreset(e),this._originalUploadedContent){console.log(`📁 Reprocessing uploaded content with ${e.name} preset`);const i=await this.processContentWithPreset(this._originalUploadedContent,e);await this.runValidation(i,new Blob([i]).size),this.setUploadedContent(i);return}if(this._originalGithubContent){console.log(`🔗 Reprocessing GitHub content with ${e.name} preset`);const i=await this.processContentWithPreset(this._originalGithubContent,e);await this.runValidation(i,new Blob([i]).size),this.setUploadedContent(i);return}console.log("⚠️ No original content available to reprocess")}getUploadedFileInfo(){const e=this.getUploadedContent();return{hasContent:e!==null,size:e?new Blob([e]).size:void 0}}hasOriginalContent(){return this._originalUploadedContent!==null||this._originalGithubContent!==null}async runValidation(e,i){const t=this.getCurrentPreset(),r={categories:[]},a=new Lh().validate(e,i);if(r.categories.push(...a.categories),t)switch(t.id){case"facebook":const l=new Bh().validate(e,i);r.categories.push(...l.categories);break;case"mraid":const c=new Fh().validate(e,i);r.categories.push(...c.categories);break}this._validationResults=r;for(const o of Array.from(this._validationListeners))o(r)}getValidationResults(){return this._validationResults}onValidationChange(e){return this._validationListeners.add(e),()=>this._validationListeners.delete(e)}handleScreenLockChange(e){try{const i=new CustomEvent("playable-screen-lock",{detail:{locked:e}});window.dispatchEvent(i),console.log("PreviewService: dispatched playable-screen-lock",e)}catch(i){console.warn("PreviewService: handleScreenLockChange failed",i)}}};rr=Zh([vi()],rr);/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */(function(e,i){typeof exports=="object"&&typeof module<"u"?i(exports):typeof define=="function"&&define.amd?define(["exports"],i):i((e=typeof globalThis<"u"?globalThis:e||self).pako={})})(void 0,function(e){var i=(d,f,s,g)=>{let m=65535&d|0,p=d>>>16&65535|0,A=0;for(;s!==0;){A=s>2e3?2e3:s,s-=A;do m=m+f[g++]|0,p=p+m|0;while(--A);m%=65521,p%=65521}return m|p<<16|0};const t=new Uint32Array((()=>{let d,f=[];for(var s=0;s<256;s++){d=s;for(var g=0;g<8;g++)d=1&d?3988292384^d>>>1:d>>>1;f[s]=d}return f})());var r=(d,f,s,g)=>{const m=t,p=g+s;d^=-1;for(let A=g;A<p;A++)d=d>>>8^m[255&(d^f[A])];return-1^d};const n=16209;var a=function(d,f){let s,g,m,p,A,$,L,_,k,be,Z,C,ve,ie,N,se,K,R,Q,de,B,ne,Y,V;const J=d.state;s=d.next_in,Y=d.input,g=s+(d.avail_in-5),m=d.next_out,V=d.output,p=m-(f-d.avail_out),A=m+(d.avail_out-257),$=J.dmax,L=J.wsize,_=J.whave,k=J.wnext,be=J.window,Z=J.hold,C=J.bits,ve=J.lencode,ie=J.distcode,N=(1<<J.lenbits)-1,se=(1<<J.distbits)-1;e:do{C<15&&(Z+=Y[s++]<<C,C+=8,Z+=Y[s++]<<C,C+=8),K=ve[Z&N];t:for(;;){if(R=K>>>24,Z>>>=R,C-=R,R=K>>>16&255,R===0)V[m++]=65535&K;else{if(!(16&R)){if((64&R)==0){K=ve[(65535&K)+(Z&(1<<R)-1)];continue t}if(32&R){J.mode=16191;break e}d.msg="invalid literal/length code",J.mode=n;break e}Q=65535&K,R&=15,R&&(C<R&&(Z+=Y[s++]<<C,C+=8),Q+=Z&(1<<R)-1,Z>>>=R,C-=R),C<15&&(Z+=Y[s++]<<C,C+=8,Z+=Y[s++]<<C,C+=8),K=ie[Z&se];i:for(;;){if(R=K>>>24,Z>>>=R,C-=R,R=K>>>16&255,!(16&R)){if((64&R)==0){K=ie[(65535&K)+(Z&(1<<R)-1)];continue i}d.msg="invalid distance code",J.mode=n;break e}if(de=65535&K,R&=15,C<R&&(Z+=Y[s++]<<C,C+=8,C<R&&(Z+=Y[s++]<<C,C+=8)),de+=Z&(1<<R)-1,de>$){d.msg="invalid distance too far back",J.mode=n;break e}if(Z>>>=R,C-=R,R=m-p,de>R){if(R=de-R,R>_&&J.sane){d.msg="invalid distance too far back",J.mode=n;break e}if(B=0,ne=be,k===0){if(B+=L-R,R<Q){Q-=R;do V[m++]=be[B++];while(--R);B=m-de,ne=V}}else if(k<R){if(B+=L+k-R,R-=k,R<Q){Q-=R;do V[m++]=be[B++];while(--R);if(B=0,k<Q){R=k,Q-=R;do V[m++]=be[B++];while(--R);B=m-de,ne=V}}}else if(B+=k-R,R<Q){Q-=R;do V[m++]=be[B++];while(--R);B=m-de,ne=V}for(;Q>2;)V[m++]=ne[B++],V[m++]=ne[B++],V[m++]=ne[B++],Q-=3;Q&&(V[m++]=ne[B++],Q>1&&(V[m++]=ne[B++]))}else{B=m-de;do V[m++]=V[B++],V[m++]=V[B++],V[m++]=V[B++],Q-=3;while(Q>2);Q&&(V[m++]=V[B++],Q>1&&(V[m++]=V[B++]))}break}}break}}while(s<g&&m<A);Q=C>>3,s-=Q,C-=Q<<3,Z&=(1<<C)-1,d.next_in=s,d.next_out=m,d.avail_in=s<g?g-s+5:5-(s-g),d.avail_out=m<A?A-m+257:257-(m-A),J.hold=Z,J.bits=C};const o=15,l=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),u=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),c=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),h=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]);var x=(d,f,s,g,m,p,A,$)=>{const L=$.bits;let _,k,be,Z,C,ve,ie=0,N=0,se=0,K=0,R=0,Q=0,de=0,B=0,ne=0,Y=0,V=null;const J=new Uint16Array(16),ye=new Uint16Array(16);let Kt,Mi,zi,Li=null;for(ie=0;ie<=o;ie++)J[ie]=0;for(N=0;N<g;N++)J[f[s+N]]++;for(R=L,K=o;K>=1&&J[K]===0;K--);if(R>K&&(R=K),K===0)return m[p++]=20971520,m[p++]=20971520,$.bits=1,0;for(se=1;se<K&&J[se]===0;se++);for(R<se&&(R=se),B=1,ie=1;ie<=o;ie++)if(B<<=1,B-=J[ie],B<0)return-1;if(B>0&&(d===0||K!==1))return-1;for(ye[1]=0,ie=1;ie<o;ie++)ye[ie+1]=ye[ie]+J[ie];for(N=0;N<g;N++)f[s+N]!==0&&(A[ye[f[s+N]]++]=N);if(d===0?(V=Li=A,ve=20):d===1?(V=l,Li=u,ve=257):(V=c,Li=h,ve=0),Y=0,N=0,ie=se,C=p,Q=R,de=0,be=-1,ne=1<<R,Z=ne-1,d===1&&ne>852||d===2&&ne>592)return 1;for(;;){Kt=ie-de,A[N]+1<ve?(Mi=0,zi=A[N]):A[N]>=ve?(Mi=Li[A[N]-ve],zi=V[A[N]-ve]):(Mi=96,zi=0),_=1<<ie-de,k=1<<Q,se=k;do k-=_,m[C+(Y>>de)+k]=Kt<<24|Mi<<16|zi|0;while(k!==0);for(_=1<<ie-1;Y&_;)_>>=1;if(_!==0?(Y&=_-1,Y+=_):Y=0,N++,--J[ie]==0){if(ie===K)break;ie=f[s+A[N]]}if(ie>R&&(Y&Z)!==be){for(de===0&&(de=R),C+=se,Q=ie-de,B=1<<Q;Q+de<K&&(B-=J[Q+de],!(B<=0));)Q++,B<<=1;if(ne+=1<<Q,d===1&&ne>852||d===2&&ne>592)return 1;be=Y&Z,m[be]=R<<24|Q<<16|C-p|0}}return Y!==0&&(m[C+Y]=ie-de<<24|64<<16|0),$.bits=R,0},y={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};const{Z_FINISH:v,Z_BLOCK:E,Z_TREES:H,Z_OK:M,Z_STREAM_END:O,Z_NEED_DICT:q,Z_STREAM_ERROR:I,Z_DATA_ERROR:P,Z_MEM_ERROR:X,Z_BUF_ERROR:ce,Z_DEFLATED:D}=y,te=16180,G=16190,z=16191,W=16192,Ae=16194,He=16199,Oe=16200,De=16206,le=16209,Ft=d=>(d>>>24&255)+(d>>>8&65280)+((65280&d)<<8)+((255&d)<<24);function Pi(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const Ie=d=>{if(!d)return 1;const f=d.state;return!f||f.strm!==d||f.mode<te||f.mode>16211?1:0},Nt=d=>{if(Ie(d))return I;const f=d.state;return d.total_in=d.total_out=f.total=0,d.msg="",f.wrap&&(d.adler=1&f.wrap),f.mode=te,f.last=0,f.havedict=0,f.flags=-1,f.dmax=32768,f.head=null,f.hold=0,f.bits=0,f.lencode=f.lendyn=new Int32Array(852),f.distcode=f.distdyn=new Int32Array(592),f.sane=1,f.back=-1,M},Zt=d=>{if(Ie(d))return I;const f=d.state;return f.wsize=0,f.whave=0,f.wnext=0,Nt(d)},Ht=(d,f)=>{let s;if(Ie(d))return I;const g=d.state;return f<0?(s=0,f=-f):(s=5+(f>>4),f<48&&(f&=15)),f&&(f<8||f>15)?I:(g.window!==null&&g.wbits!==f&&(g.window=null),g.wrap=s,g.wbits=f,Zt(d))},j=(d,f)=>{if(!d)return I;const s=new Pi;d.state=s,s.strm=d,s.window=null,s.mode=te;const g=Ht(d,f);return g!==M&&(d.state=null),g};let Me,jt,fe=!0;const ur=d=>{if(fe){Me=new Int32Array(512),jt=new Int32Array(32);let f=0;for(;f<144;)d.lens[f++]=8;for(;f<256;)d.lens[f++]=9;for(;f<280;)d.lens[f++]=7;for(;f<288;)d.lens[f++]=8;for(x(1,d.lens,0,288,Me,0,d.work,{bits:9}),f=0;f<32;)d.lens[f++]=5;x(2,d.lens,0,32,jt,0,d.work,{bits:5}),fe=!1}d.lencode=Me,d.lenbits=9,d.distcode=jt,d.distbits=5},Ti=(d,f,s,g)=>{let m;const p=d.state;return p.window===null&&(p.wsize=1<<p.wbits,p.wnext=0,p.whave=0,p.window=new Uint8Array(p.wsize)),g>=p.wsize?(p.window.set(f.subarray(s-p.wsize,s),0),p.wnext=0,p.whave=p.wsize):(m=p.wsize-p.wnext,m>g&&(m=g),p.window.set(f.subarray(s-g,s-g+m),p.wnext),(g-=m)?(p.window.set(f.subarray(s-g,s),0),p.wnext=g,p.whave=p.wsize):(p.wnext+=m,p.wnext===p.wsize&&(p.wnext=0),p.whave<p.wsize&&(p.whave+=m))),0};var Pe={inflateReset:Zt,inflateReset2:Ht,inflateResetKeep:Nt,inflateInit:d=>j(d,15),inflateInit2:j,inflate:(d,f)=>{let s,g,m,p,A,$,L,_,k,be,Z,C,ve,ie,N,se,K,R,Q,de,B,ne,Y=0;const V=new Uint8Array(4);let J,ye;const Kt=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(Ie(d)||!d.output||!d.input&&d.avail_in!==0)return I;s=d.state,s.mode===z&&(s.mode=W),A=d.next_out,m=d.output,L=d.avail_out,p=d.next_in,g=d.input,$=d.avail_in,_=s.hold,k=s.bits,be=$,Z=L,ne=M;e:for(;;)switch(s.mode){case te:if(s.wrap===0){s.mode=W;break}for(;k<16;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if(2&s.wrap&&_===35615){s.wbits===0&&(s.wbits=15),s.check=0,V[0]=255&_,V[1]=_>>>8&255,s.check=r(s.check,V,2,0),_=0,k=0,s.mode=16181;break}if(s.head&&(s.head.done=!1),!(1&s.wrap)||(((255&_)<<8)+(_>>8))%31){d.msg="incorrect header check",s.mode=le;break}if((15&_)!==D){d.msg="unknown compression method",s.mode=le;break}if(_>>>=4,k-=4,B=8+(15&_),s.wbits===0&&(s.wbits=B),B>15||B>s.wbits){d.msg="invalid window size",s.mode=le;break}s.dmax=1<<s.wbits,s.flags=0,d.adler=s.check=1,s.mode=512&_?16189:z,_=0,k=0;break;case 16181:for(;k<16;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if(s.flags=_,(255&s.flags)!==D){d.msg="unknown compression method",s.mode=le;break}if(57344&s.flags){d.msg="unknown header flags set",s.mode=le;break}s.head&&(s.head.text=_>>8&1),512&s.flags&&4&s.wrap&&(V[0]=255&_,V[1]=_>>>8&255,s.check=r(s.check,V,2,0)),_=0,k=0,s.mode=16182;case 16182:for(;k<32;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}s.head&&(s.head.time=_),512&s.flags&&4&s.wrap&&(V[0]=255&_,V[1]=_>>>8&255,V[2]=_>>>16&255,V[3]=_>>>24&255,s.check=r(s.check,V,4,0)),_=0,k=0,s.mode=16183;case 16183:for(;k<16;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}s.head&&(s.head.xflags=255&_,s.head.os=_>>8),512&s.flags&&4&s.wrap&&(V[0]=255&_,V[1]=_>>>8&255,s.check=r(s.check,V,2,0)),_=0,k=0,s.mode=16184;case 16184:if(1024&s.flags){for(;k<16;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}s.length=_,s.head&&(s.head.extra_len=_),512&s.flags&&4&s.wrap&&(V[0]=255&_,V[1]=_>>>8&255,s.check=r(s.check,V,2,0)),_=0,k=0}else s.head&&(s.head.extra=null);s.mode=16185;case 16185:if(1024&s.flags&&(C=s.length,C>$&&(C=$),C&&(s.head&&(B=s.head.extra_len-s.length,s.head.extra||(s.head.extra=new Uint8Array(s.head.extra_len)),s.head.extra.set(g.subarray(p,p+C),B)),512&s.flags&&4&s.wrap&&(s.check=r(s.check,g,C,p)),$-=C,p+=C,s.length-=C),s.length))break e;s.length=0,s.mode=16186;case 16186:if(2048&s.flags){if($===0)break e;C=0;do B=g[p+C++],s.head&&B&&s.length<65536&&(s.head.name+=String.fromCharCode(B));while(B&&C<$);if(512&s.flags&&4&s.wrap&&(s.check=r(s.check,g,C,p)),$-=C,p+=C,B)break e}else s.head&&(s.head.name=null);s.length=0,s.mode=16187;case 16187:if(4096&s.flags){if($===0)break e;C=0;do B=g[p+C++],s.head&&B&&s.length<65536&&(s.head.comment+=String.fromCharCode(B));while(B&&C<$);if(512&s.flags&&4&s.wrap&&(s.check=r(s.check,g,C,p)),$-=C,p+=C,B)break e}else s.head&&(s.head.comment=null);s.mode=16188;case 16188:if(512&s.flags){for(;k<16;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if(4&s.wrap&&_!==(65535&s.check)){d.msg="header crc mismatch",s.mode=le;break}_=0,k=0}s.head&&(s.head.hcrc=s.flags>>9&1,s.head.done=!0),d.adler=s.check=0,s.mode=z;break;case 16189:for(;k<32;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}d.adler=s.check=Ft(_),_=0,k=0,s.mode=G;case G:if(s.havedict===0)return d.next_out=A,d.avail_out=L,d.next_in=p,d.avail_in=$,s.hold=_,s.bits=k,q;d.adler=s.check=1,s.mode=z;case z:if(f===E||f===H)break e;case W:if(s.last){_>>>=7&k,k-=7&k,s.mode=De;break}for(;k<3;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}switch(s.last=1&_,_>>>=1,k-=1,3&_){case 0:s.mode=16193;break;case 1:if(ur(s),s.mode=He,f===H){_>>>=2,k-=2;break e}break;case 2:s.mode=16196;break;case 3:d.msg="invalid block type",s.mode=le}_>>>=2,k-=2;break;case 16193:for(_>>>=7&k,k-=7&k;k<32;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if((65535&_)!=(_>>>16^65535)){d.msg="invalid stored block lengths",s.mode=le;break}if(s.length=65535&_,_=0,k=0,s.mode=Ae,f===H)break e;case Ae:s.mode=16195;case 16195:if(C=s.length,C){if(C>$&&(C=$),C>L&&(C=L),C===0)break e;m.set(g.subarray(p,p+C),A),$-=C,p+=C,L-=C,A+=C,s.length-=C;break}s.mode=z;break;case 16196:for(;k<14;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if(s.nlen=257+(31&_),_>>>=5,k-=5,s.ndist=1+(31&_),_>>>=5,k-=5,s.ncode=4+(15&_),_>>>=4,k-=4,s.nlen>286||s.ndist>30){d.msg="too many length or distance symbols",s.mode=le;break}s.have=0,s.mode=16197;case 16197:for(;s.have<s.ncode;){for(;k<3;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}s.lens[Kt[s.have++]]=7&_,_>>>=3,k-=3}for(;s.have<19;)s.lens[Kt[s.have++]]=0;if(s.lencode=s.lendyn,s.lenbits=7,J={bits:s.lenbits},ne=x(0,s.lens,0,19,s.lencode,0,s.work,J),s.lenbits=J.bits,ne){d.msg="invalid code lengths set",s.mode=le;break}s.have=0,s.mode=16198;case 16198:for(;s.have<s.nlen+s.ndist;){for(;Y=s.lencode[_&(1<<s.lenbits)-1],N=Y>>>24,se=Y>>>16&255,K=65535&Y,!(N<=k);){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if(K<16)_>>>=N,k-=N,s.lens[s.have++]=K;else{if(K===16){for(ye=N+2;k<ye;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if(_>>>=N,k-=N,s.have===0){d.msg="invalid bit length repeat",s.mode=le;break}B=s.lens[s.have-1],C=3+(3&_),_>>>=2,k-=2}else if(K===17){for(ye=N+3;k<ye;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}_>>>=N,k-=N,B=0,C=3+(7&_),_>>>=3,k-=3}else{for(ye=N+7;k<ye;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}_>>>=N,k-=N,B=0,C=11+(127&_),_>>>=7,k-=7}if(s.have+C>s.nlen+s.ndist){d.msg="invalid bit length repeat",s.mode=le;break}for(;C--;)s.lens[s.have++]=B}}if(s.mode===le)break;if(s.lens[256]===0){d.msg="invalid code -- missing end-of-block",s.mode=le;break}if(s.lenbits=9,J={bits:s.lenbits},ne=x(1,s.lens,0,s.nlen,s.lencode,0,s.work,J),s.lenbits=J.bits,ne){d.msg="invalid literal/lengths set",s.mode=le;break}if(s.distbits=6,s.distcode=s.distdyn,J={bits:s.distbits},ne=x(2,s.lens,s.nlen,s.ndist,s.distcode,0,s.work,J),s.distbits=J.bits,ne){d.msg="invalid distances set",s.mode=le;break}if(s.mode=He,f===H)break e;case He:s.mode=Oe;case Oe:if($>=6&&L>=258){d.next_out=A,d.avail_out=L,d.next_in=p,d.avail_in=$,s.hold=_,s.bits=k,a(d,Z),A=d.next_out,m=d.output,L=d.avail_out,p=d.next_in,g=d.input,$=d.avail_in,_=s.hold,k=s.bits,s.mode===z&&(s.back=-1);break}for(s.back=0;Y=s.lencode[_&(1<<s.lenbits)-1],N=Y>>>24,se=Y>>>16&255,K=65535&Y,!(N<=k);){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if(se&&(240&se)==0){for(R=N,Q=se,de=K;Y=s.lencode[de+((_&(1<<R+Q)-1)>>R)],N=Y>>>24,se=Y>>>16&255,K=65535&Y,!(R+N<=k);){if($===0)break e;$--,_+=g[p++]<<k,k+=8}_>>>=R,k-=R,s.back+=R}if(_>>>=N,k-=N,s.back+=N,s.length=K,se===0){s.mode=16205;break}if(32&se){s.back=-1,s.mode=z;break}if(64&se){d.msg="invalid literal/length code",s.mode=le;break}s.extra=15&se,s.mode=16201;case 16201:if(s.extra){for(ye=s.extra;k<ye;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}s.length+=_&(1<<s.extra)-1,_>>>=s.extra,k-=s.extra,s.back+=s.extra}s.was=s.length,s.mode=16202;case 16202:for(;Y=s.distcode[_&(1<<s.distbits)-1],N=Y>>>24,se=Y>>>16&255,K=65535&Y,!(N<=k);){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if((240&se)==0){for(R=N,Q=se,de=K;Y=s.distcode[de+((_&(1<<R+Q)-1)>>R)],N=Y>>>24,se=Y>>>16&255,K=65535&Y,!(R+N<=k);){if($===0)break e;$--,_+=g[p++]<<k,k+=8}_>>>=R,k-=R,s.back+=R}if(_>>>=N,k-=N,s.back+=N,64&se){d.msg="invalid distance code",s.mode=le;break}s.offset=K,s.extra=15&se,s.mode=16203;case 16203:if(s.extra){for(ye=s.extra;k<ye;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}s.offset+=_&(1<<s.extra)-1,_>>>=s.extra,k-=s.extra,s.back+=s.extra}if(s.offset>s.dmax){d.msg="invalid distance too far back",s.mode=le;break}s.mode=16204;case 16204:if(L===0)break e;if(C=Z-L,s.offset>C){if(C=s.offset-C,C>s.whave&&s.sane){d.msg="invalid distance too far back",s.mode=le;break}C>s.wnext?(C-=s.wnext,ve=s.wsize-C):ve=s.wnext-C,C>s.length&&(C=s.length),ie=s.window}else ie=m,ve=A-s.offset,C=s.length;C>L&&(C=L),L-=C,s.length-=C;do m[A++]=ie[ve++];while(--C);s.length===0&&(s.mode=Oe);break;case 16205:if(L===0)break e;m[A++]=s.length,L--,s.mode=Oe;break;case De:if(s.wrap){for(;k<32;){if($===0)break e;$--,_|=g[p++]<<k,k+=8}if(Z-=L,d.total_out+=Z,s.total+=Z,4&s.wrap&&Z&&(d.adler=s.check=s.flags?r(s.check,m,Z,A-Z):i(s.check,m,Z,A-Z)),Z=L,4&s.wrap&&(s.flags?_:Ft(_))!==s.check){d.msg="incorrect data check",s.mode=le;break}_=0,k=0}s.mode=16207;case 16207:if(s.wrap&&s.flags){for(;k<32;){if($===0)break e;$--,_+=g[p++]<<k,k+=8}if(4&s.wrap&&_!==(4294967295&s.total)){d.msg="incorrect length check",s.mode=le;break}_=0,k=0}s.mode=16208;case 16208:ne=O;break e;case le:ne=P;break e;case 16210:return X;default:return I}return d.next_out=A,d.avail_out=L,d.next_in=p,d.avail_in=$,s.hold=_,s.bits=k,(s.wsize||Z!==d.avail_out&&s.mode<le&&(s.mode<De||f!==v))&&Ti(d,d.output,d.next_out,Z-d.avail_out),be-=d.avail_in,Z-=d.avail_out,d.total_in+=be,d.total_out+=Z,s.total+=Z,4&s.wrap&&Z&&(d.adler=s.check=s.flags?r(s.check,m,Z,d.next_out-Z):i(s.check,m,Z,d.next_out-Z)),d.data_type=s.bits+(s.last?64:0)+(s.mode===z?128:0)+(s.mode===He||s.mode===Ae?256:0),(be===0&&Z===0||f===v)&&ne===M&&(ne=ce),ne},inflateEnd:d=>{if(Ie(d))return I;let f=d.state;return f.window&&(f.window=null),d.state=null,M},inflateGetHeader:(d,f)=>{if(Ie(d))return I;const s=d.state;return(2&s.wrap)==0?I:(s.head=f,f.done=!1,M)},inflateSetDictionary:(d,f)=>{const s=f.length;let g,m,p;return Ie(d)?I:(g=d.state,g.wrap!==0&&g.mode!==G?I:g.mode===G&&(m=1,m=i(m,f,s,0),m!==g.check)?P:(p=Ti(d,f,s,s),p?(g.mode=16210,X):(g.havedict=1,M)))},inflateInfo:"pako inflate (from Nodeca project)"};const fr=(d,f)=>Object.prototype.hasOwnProperty.call(d,f);var Te=function(d){const f=Array.prototype.slice.call(arguments,1);for(;f.length;){const s=f.shift();if(s){if(typeof s!="object")throw new TypeError(s+"must be non-object");for(const g in s)fr(s,g)&&(d[g]=s[g])}}return d},Ri=d=>{let f=0;for(let g=0,m=d.length;g<m;g++)f+=d[g].length;const s=new Uint8Array(f);for(let g=0,m=0,p=d.length;g<p;g++){let A=d[g];s.set(A,m),m+=A.length}return s};let st=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{st=!1}const Je=new Uint8Array(256);for(let d=0;d<256;d++)Je[d]=d>=252?6:d>=248?5:d>=240?4:d>=224?3:d>=192?2:1;Je[254]=Je[254]=1;var pr=d=>{if(typeof TextEncoder=="function"&&TextEncoder.prototype.encode)return new TextEncoder().encode(d);let f,s,g,m,p,A=d.length,$=0;for(m=0;m<A;m++)s=d.charCodeAt(m),(64512&s)==55296&&m+1<A&&(g=d.charCodeAt(m+1),(64512&g)==56320&&(s=65536+(s-55296<<10)+(g-56320),m++)),$+=s<128?1:s<2048?2:s<65536?3:4;for(f=new Uint8Array($),p=0,m=0;p<$;m++)s=d.charCodeAt(m),(64512&s)==55296&&m+1<A&&(g=d.charCodeAt(m+1),(64512&g)==56320&&(s=65536+(s-55296<<10)+(g-56320),m++)),s<128?f[p++]=s:s<2048?(f[p++]=192|s>>>6,f[p++]=128|63&s):s<65536?(f[p++]=224|s>>>12,f[p++]=128|s>>>6&63,f[p++]=128|63&s):(f[p++]=240|s>>>18,f[p++]=128|s>>>12&63,f[p++]=128|s>>>6&63,f[p++]=128|63&s);return f},qt=(d,f)=>{const s=f||d.length;if(typeof TextDecoder=="function"&&TextDecoder.prototype.decode)return new TextDecoder().decode(d.subarray(0,f));let g,m;const p=new Array(2*s);for(m=0,g=0;g<s;){let A=d[g++];if(A<128){p[m++]=A;continue}let $=Je[A];if($>4)p[m++]=65533,g+=$-1;else{for(A&=$===2?31:$===3?15:7;$>1&&g<s;)A=A<<6|63&d[g++],$--;$>1?p[m++]=65533:A<65536?p[m++]=A:(A-=65536,p[m++]=55296|A>>10&1023,p[m++]=56320|1023&A)}}return((A,$)=>{if($<65534&&A.subarray&&st)return String.fromCharCode.apply(null,A.length===$?A:A.subarray(0,$));let L="";for(let _=0;_<$;_++)L+=String.fromCharCode(A[_]);return L})(p,m)},Ui=(d,f)=>{(f=f||d.length)>d.length&&(f=d.length);let s=f-1;for(;s>=0&&(192&d[s])==128;)s--;return s<0||s===0?f:s+Je[d[s]]>f?s:f},At={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},Oi=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0},Di=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1};const Vt=Object.prototype.toString,{Z_NO_FLUSH:Gt,Z_FINISH:gr,Z_OK:ot,Z_STREAM_END:Wt,Z_NEED_DICT:Yt,Z_STREAM_ERROR:lt,Z_DATA_ERROR:Ii,Z_MEM_ERROR:br}=y;function ct(d){this.options=Te({chunkSize:65536,windowBits:15,to:""},d||{});const f=this.options;f.raw&&f.windowBits>=0&&f.windowBits<16&&(f.windowBits=-f.windowBits,f.windowBits===0&&(f.windowBits=-15)),!(f.windowBits>=0&&f.windowBits<16)||d&&d.windowBits||(f.windowBits+=32),f.windowBits>15&&f.windowBits<48&&(15&f.windowBits)==0&&(f.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Oi,this.strm.avail_out=0;let s=Pe.inflateInit2(this.strm,f.windowBits);if(s!==ot)throw new Error(At[s]);if(this.header=new Di,Pe.inflateGetHeader(this.strm,this.header),f.dictionary&&(typeof f.dictionary=="string"?f.dictionary=pr(f.dictionary):Vt.call(f.dictionary)==="[object ArrayBuffer]"&&(f.dictionary=new Uint8Array(f.dictionary)),f.raw&&(s=Pe.inflateSetDictionary(this.strm,f.dictionary),s!==ot)))throw new Error(At[s])}function dt(d,f){const s=new ct(f);if(s.push(d),s.err)throw s.msg||At[s.err];return s.result}ct.prototype.push=function(d,f){const s=this.strm,g=this.options.chunkSize,m=this.options.dictionary;let p,A,$;if(this.ended)return!1;for(A=f===~~f?f:f===!0?gr:Gt,Vt.call(d)==="[object ArrayBuffer]"?s.input=new Uint8Array(d):s.input=d,s.next_in=0,s.avail_in=s.input.length;;){for(s.avail_out===0&&(s.output=new Uint8Array(g),s.next_out=0,s.avail_out=g),p=Pe.inflate(s,A),p===Yt&&m&&(p=Pe.inflateSetDictionary(s,m),p===ot?p=Pe.inflate(s,A):p===Ii&&(p=Yt));s.avail_in>0&&p===Wt&&s.state.wrap>0&&d[s.next_in]!==0;)Pe.inflateReset(s),p=Pe.inflate(s,A);switch(p){case lt:case Ii:case Yt:case br:return this.onEnd(p),this.ended=!0,!1}if($=s.avail_out,s.next_out&&(s.avail_out===0||p===Wt))if(this.options.to==="string"){let L=Ui(s.output,s.next_out),_=s.next_out-L,k=qt(s.output,L);s.next_out=_,s.avail_out=g-_,_&&s.output.set(s.output.subarray(L,L+_),0),this.onData(k)}else this.onData(s.output.length===s.next_out?s.output:s.output.subarray(0,s.next_out));if(p!==ot||$!==0){if(p===Wt)return p=Pe.inflateEnd(this.strm),this.onEnd(p),this.ended=!0,!0;if(s.avail_in===0)break}}return!0},ct.prototype.onData=function(d){this.chunks.push(d)},ct.prototype.onEnd=function(d){d===ot&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=Ri(this.chunks)),this.chunks=[],this.err=d,this.msg=this.strm.msg};var b=ct,w=dt,S=function(d,f){return(f=f||{}).raw=!0,dt(d,f)},T=dt,F=y,ue={Inflate:b,inflate:w,inflateRaw:S,ungzip:T,constants:F};e.Inflate=b,e.constants=F,e.default=ue,e.inflate=w,e.inflateRaw=S,e.ungzip=T,Object.defineProperty(e,"__esModule",{value:!0})});var Hh=Object.defineProperty,jh=Object.getOwnPropertyDescriptor,Xe=(e,i,t,r)=>{for(var n=r>1?void 0:r?jh(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&Hh(i,t,n),n};let Ze=class extends ge{constructor(){super(...arguments),this.githubUrl="",this.pageContent="",this.loading=!0,this.error="",this.currentPreset=null,this.availablePresets=[],this.isPresetSwitching=!1,this.presetSuccessMessage="",this.validationResults=null,this.devices=[{name:"iPhone 14 Pro Max",width:430,height:932,type:"phone"},{name:"iPhone 14",width:390,height:844,type:"phone"},{name:"iPhone SE",width:375,height:667,type:"phone"},{name:"Google Pixel 7 Pro",width:412,height:892,type:"phone"},{name:"Samsung Galaxy S23 Ultra",width:384,height:851,type:"phone"},{name:"Generic Android",width:360,height:800,type:"phone"},{name:"--- Tablets ---",disabled:!0},{name:'iPad Pro 12.9"',width:1024,height:1366,type:"tablet"},{name:"iPad Air",width:820,height:1180,type:"tablet"},{name:"Samsung Galaxy Tab S8",width:800,height:1280,type:"tablet"},{name:"Generic tablet",width:768,height:1024,type:"tablet"}],this.selectedDeviceIdx=2,this.isPortrait=!0,this._locked=!1}connectedCallback(){super.connectedCallback(),this.availablePresets=this.previewService.getAvailablePresets(),this.currentPreset=this.previewService.getCurrentPreset(),this.uploadedContentUnsubscribe=this.previewService.onUploadedContentChange(i=>{i?(this.pageContent=i,this.loading=!1,this.error="",this.requestUpdate()):console.log("📁 Uploaded content cleared")}),this.presetUnsubscribe=this.previewService.onPresetChange(i=>{this.currentPreset=i,this.requestUpdate()}),this.validationUnsubscribe=this.previewService.onValidationChange(i=>{this.validationResults=i,this.requestUpdate()});const e=this.previewService.getUploadedContent();e&&(this.pageContent=e,this.loading=!1,this.requestUpdate()),this.validationResults=this.previewService.getValidationResults(),this._playableLockHandler=i=>{try{const t=i;this._locked=!!t.detail?.locked,this.requestUpdate()}catch(t){console.warn("playable-previewer: lock handler error",t)}},window.addEventListener("playable-screen-lock",this._playableLockHandler)}disconnectedCallback(){super.disconnectedCallback(),this.uploadedContentUnsubscribe&&this.uploadedContentUnsubscribe(),this.presetUnsubscribe&&this.presetUnsubscribe(),this.validationUnsubscribe&&this.validationUnsubscribe(),this._playableLockHandler&&window.removeEventListener("playable-screen-lock",this._playableLockHandler)}_toggleLock(){this._locked=!this._locked;try{this.previewService.handleScreenLockChange(this._locked)}catch(e){console.warn("playable-previewer: failed to notify service about lock change",e)}this.requestUpdate()}async updated(e){e.has("githubUrl")&&this.githubUrl&&await this.loadFromGithub()}async loadFromGithub(){this.loading=!0,this.error="",this.pageContent="";const e=this.previewService.githubToRawUrl(this.githubUrl);if(!e){console.error(`❌ Invalid GitHub URL: ${this.githubUrl}`),this.error="Invalid GitHub URL",this.loading=!1,this.requestUpdate();return}try{this.pageContent=await this.previewService.fetchRawContent(e)}catch(i){console.error("❌ Failed to load from GitHub:",i),this.error=i.message||String(i)}this.loading=!1,this.requestUpdate()}get selectedDevice(){return this.devices[this.selectedDeviceIdx]||this.devices[0]}handleDeviceChange(e){const i=Number(e.target.value);this.selectedDeviceIdx=i,this.requestUpdate()}toggleOrientation(){this.isPortrait=!this.isPortrait,this.requestUpdate()}async handlePresetChange(e){const i=e.target.value,t=this.previewService.getPresetById(i);if(t){this.isPresetSwitching=!0,this.error="",this.requestUpdate();try{this.previewService.setCurrentPreset(t),await this.previewService.reloadContentWithPreset(t),this.presetSuccessMessage=`✅ Applied ${t.name} preset`,setTimeout(()=>{this.presetSuccessMessage="",this.requestUpdate()},3e3)}catch(r){console.error("❌ Failed to switch preset:",r),this.error=`Failed to apply preset: ${r instanceof Error?r.message:String(r)}`}finally{this.isPresetSwitching=!1,this.requestUpdate()}}}render(){const e=this.selectedDevice,i=this.isPortrait?e.width:e.height,t=this.isPortrait?e.height:e.width;return U`
      <!-- Device Controls -->
      <div class="device-controls" style="margin-bottom: 1em; display: flex; align-items: center; gap: 1em; flex-wrap: wrap;">
        <!-- Preset Selection -->
        <div style="display: flex; align-items: center; gap: 0.5em;">
          <label for="preset-select" style="font-weight: bold; color: #1976d2;">Validator:</label>
          <select 
            id="preset-select"
            @change="${this.handlePresetChange.bind(this)}" 
            style="margin-bottom: 0; min-width: 150px; ${this.isPresetSwitching?"opacity: 0.7;":""}"
            title="${this.currentPreset?.description||""}"
            ?disabled="${this.isPresetSwitching}"
          >
            ${this.availablePresets.map(r=>U`<option 
                value="${r.id}" 
                ?selected="${r.id===this.currentPreset?.id}"
              >
                ${r.name}
              </option>`)}
          </select>
          ${this.isPresetSwitching?U`
            <div style="display: flex; align-items: center; gap: 0.5em; color: #1976d2;">
              <div class="preset-spinner"></div>
              <span style="font-size: 0.9em;">Switching...</span>
            </div>
          `:""}
        </div>
        
        <!-- Device Selection -->
        <div style="display: flex; align-items: center; gap: 0.5em;">
          <label for="device-select" style="font-weight: bold; color: #1976d2;">Device:</label>
          <select id="device-select" @change="${this.handleDeviceChange.bind(this)}" style="margin-bottom: 0;">
            ${this.devices.map((r,n)=>r.disabled?U`<option disabled> ${r.name} </option>`:U`<option value="${n}" ?selected="${n===this.selectedDeviceIdx}">${r.name}</option>`)}
          </select>
        </div>
        
        <!-- Preset Info -->
        ${this.currentPreset?U`
          <div style="font-size: 0.9em; color: #666; margin-left: auto; display: flex; align-items: center; gap: 1em;">
            <span>
              Max size: ${this.currentPreset.maxFileSizeMB}MB
              ${this.currentPreset.injectScripts.length>0?U`• Scripts: ${this.currentPreset.injectScripts.length}`:""}
            </span>
            ${this.presetSuccessMessage?U`
              <span style="color: #4CAF50; font-weight: bold; animation: fadeInOut 3s ease-in-out;">
                ${this.presetSuccessMessage}
              </span>
            `:""}
          </div>
        `:""}
      </div>
      
      <!-- Simulator Controls -->
      <div class="simulator-controls" style="margin-bottom: 1em; display: flex; align-items: center; gap: 1em; justify-content: center;">
        <button @click=${()=>this.toggleOrientation()} title="${this.isPortrait?"Switch to landscape":"Switch to portrait"}" aria-label="${this.isPortrait?"Switch to landscape orientation":"Switch to portrait orientation"}" style="width:38px;height:38px;border-radius:6px;border:none;background:#1976d2;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;">
          ${this.isPortrait?"↕️":"↔️"}
        </button>
        <button @click=${()=>this._toggleLock()} title="Lock / Unlock" aria-pressed="${this._locked}" aria-label="Lock or unlock screen" style="width:38px;height:38px;border-radius:6px;border:none;background:#1976d2;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;">
          ${this._locked?"🔒":"🔓"}
        </button>
      </div>
      
      <!-- Main Content Layout -->
      <div class="preview-layout" style="display: grid; grid-template-columns: 350px 1fr; gap: 2em; align-items: start; margin-top: 1em;">
        
        <!-- Validation Results Sidebar -->
        ${this.validationResults&&this.validationResults.categories.length>0?U`
          <div class="validation-results" style="padding: 1em; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; height: fit-content;">
            <h3 style="margin: 0 0 1em 0; color: #495057; font-size: 1.1em;">Validation Results</h3>
            ${this.validationResults.categories.map(r=>U`
              <div class="validation-category" style="margin-bottom: 1em;">
                <h4 style="margin: 0 0 0.5em 0; color: #1976d2; font-size: 1em; display: flex; align-items: center; gap: 0.5em;">
                  <span style="font-size: 1.2em;">${r.checks.every(n=>n.passed)?"✅":"⚠️"}</span>
                  ${r.name}
                </h4>
                <div style="display: flex; flex-direction: column; gap: 0.3em;">
                  ${r.checks.map(n=>U`
                    <div class="validation-check" style="display: flex; align-items: flex-start; gap: 0.5em; font-size: 0.9em;">
                      <span style="font-size: 1.1em; margin-top: -2px;">${n.passed?"✅":"❌"}</span>
                      <div style="flex: 1;">
                        <span style="color: ${n.passed?"#28a745":"#dc3545"}; font-weight: ${n.passed?"normal":"bold"};">${n.name}</span>
                        ${n.details?U`
                          <div style="color: #6c757d; font-size: 0.85em; margin-top: 0.2em;">${n.details}</div>
                        `:""}
                      </div>
                    </div>
                  `)}
                </div>
              </div>
            `)}
          </div>
        `:U`
          <!-- Placeholder for validation sidebar when no results -->
          <div style="padding: 1em; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; color: #6c757d; text-align: center; font-style: italic;">
            No validation results available
          </div>
        `}
        
        <!-- Preview Frame -->
        <div class="preview-frame-container">
          <div style="display:flex; justify-content:center;">
            <div class="phone-simulator">
              <div class="phone-simulator-bg">
                <div class="phone-frame" style="width:${i}px; height:${t}px;">
                ${this.loading?U`
                      <div class="spinner-container">
                        <div class="spinner"></div>
                        <div class="loading-message" style="margin-top: 1em; font-size: 1.1em; color: #bdbdbd;">
                          ${this.isPresetSwitching?`Applying ${this.currentPreset?.name} preset...`:"Loading playable content..."}
                        </div>
                      </div>
                    `:this.error?U`
                      <div style="color: ${this.error.includes("re-upload")?"#ff9800":"red"}; padding: 1em; background: ${this.error.includes("re-upload")?"#fff3e0":"#ffebee"}; border-radius: 4px; margin: 1em;">
                        ${this.error.includes("re-upload")?"⚠️":"❌"} ${this.error}
                      </div>
                    `:this.pageContent?U`
                      <div style="position: relative; width: 100%; height: 100%;">
                        <iframe
                          srcdoc="${this.pageContent}"
                          class="playable-iframe"
                          frameborder="0"
                          allowfullscreen
                          style="width:100%; height:100%; border:none;"
                        ></iframe>
                            ${this.isPresetSwitching?U`
                              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(25, 118, 210, 0.1); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(1px);">
                                <div style="background: rgba(25, 118, 210, 0.9); color: white; padding: 1em 2em; border-radius: 8px; display: flex; align-items: center; gap: 1em;">
                                  <div class="preset-spinner"></div>
                                  <span>Applying ${this.currentPreset?.name} preset...</span>
                                </div>
                              </div>
                            `:""}
                            ${this._locked?U`
                              <div style="position: absolute; left:0; top:0; right:0; bottom:0; background: rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index: 2147483646;">
                                <div style="color:#fff; padding:12px 18px; background:rgba(0,0,0,0.6); border-radius:8px; font-size:18px;">Screen is locked</div>
                              </div>
                            `:null}

                            </div>
                      </div>
                    `:U`<div style="padding: 1em; color: #666; text-align: center;">
                      Ready to preview content.
                    </div>`}
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Responsive Styles -->
      <style>
        .preview-layout {
          margin-top: 1em;
        }
        
        .validation-results {
          max-height: 70vh;
          overflow-y: auto;
          position: sticky;
          top: 1em;
        }
        
        .preview-frame-container {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 1024px) {
          .preview-layout {
            grid-template-columns: 1fr !important;
            gap: 1em !important;
          }
          
          .validation-results {
            order: 2;
            max-height: none !important;
            position: static !important;
          }
          
          .preview-frame-container {
            order: 1;
          }
        }
        
        @media (max-width: 768px) {
          .preview-layout {
            gap: 0.5em !important;
          }
          
          .validation-results {
            padding: 0.75em !important;
          }
        }
        
        @media (min-width: 1400px) {
          .preview-layout {
            grid-template-columns: 400px 1fr;
          }
        }
      </style>
    `}};Xe([Ye({type:String})],Ze.prototype,"githubUrl",2);Xe([Mt(rr)],Ze.prototype,"previewService",2);Xe([$e()],Ze.prototype,"currentPreset",2);Xe([$e()],Ze.prototype,"availablePresets",2);Xe([$e()],Ze.prototype,"isPresetSwitching",2);Xe([$e()],Ze.prototype,"presetSuccessMessage",2);Xe([$e()],Ze.prototype,"validationResults",2);Xe([$e()],Ze.prototype,"_locked",2);Ze=Xe([we("playable-previewer")],Ze);var qh=Object.defineProperty,Vh=Object.getOwnPropertyDescriptor,Tn=(e,i,t,r)=>{for(var n=r>1?void 0:r?Vh(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&qh(i,t,n),n};let nr=class extends ge{constructor(){super(...arguments),this.urlInput="",this.decodedUrl="",this.recentUrls=[],this.isEncoded=!1,this.linkCopied=!1,this.uploadedFileName="",this.uploadError="",this.isUploading=!1,this.handlePopState=()=>{let e;const i=window.location.hash;if(i){const t=i.indexOf("?");if(t!==-1){const r=i.substring(t+1);e=new URLSearchParams(r).get("url")}}if(e||(e=new URLSearchParams(window.location.search).get("url")),!e&&this._encodedUrlFromQuery&&(e=this._encodedUrlFromQuery),e){const t=this.previewService.decodeUrl(e);this.decodedUrl=t,this._encodedUrlInternal=e,this.isEncoded=!0}else this.isEncoded=!1,this.decodedUrl="",this._encodedUrlInternal=void 0;this.requestUpdate()}}disconnectedCallback(){super.disconnectedCallback?.();const e=localStorage.getItem("preview-recent-urls");if(e)try{this.recentUrls=JSON.parse(e)}catch{this.recentUrls=[]}window.removeEventListener("popstate",this.handlePopState)}get encodedUrl(){return this._encodedUrlFromQuery}connectedCallback(){super.connectedCallback();let e;const i=window.location.hash;if(i){const t=i.indexOf("?");if(t!==-1){const r=i.substring(t+1);e=new URLSearchParams(r).get("url")}}if(e||(e=new URLSearchParams(window.location.search).get("url")),!e&&this._encodedUrlFromQuery&&(e=this._encodedUrlFromQuery),e){const t=this.previewService.decodeUrl(e);this.decodedUrl=t,this._encodedUrlInternal=e,this.isEncoded=!0,this.requestUpdate()}else{const t=localStorage.getItem("preview-recent-urls");if(t)try{this.recentUrls=JSON.parse(t)}catch{this.recentUrls=[]}this.isEncoded=!1,this.decodedUrl="",this._encodedUrlInternal=void 0}window.addEventListener("popstate",this.handlePopState)}handleInput(e){this.decodedUrl=e.target.value,this.requestUpdate()}handleLoad(){if(!this.decodedUrl)return;this._encodedUrlInternal=this.previewService.encodeUrl(this.decodedUrl),this.isEncoded=!0;let e=[];const i=localStorage.getItem("preview-recent-urls");if(i)try{e=JSON.parse(i)}catch{e=[]}e=[this.decodedUrl,...e.filter(r=>r!==this.decodedUrl)].slice(0,10),localStorage.setItem("preview-recent-urls",JSON.stringify(e));const t=new URLSearchParams;t.set("url",this._encodedUrlInternal),window.history.pushState({},"",`${window.location.pathname}#preview?${t.toString()}`),this.requestUpdate()}async handleShare(){try{await navigator.clipboard.writeText(window.location.href),this.linkCopied=!0,this.requestUpdate(),this.copyTimeout&&clearTimeout(this.copyTimeout),this.copyTimeout=window.setTimeout(()=>{this.linkCopied=!1,this.requestUpdate()},3e3)}catch{}}async handleFileUpload(e){const i=e.target,t=i.files?.[0];if(t){this.isUploading=!0,this.uploadError="",this.uploadedFileName="",this.isEncoded=!1,this.decodedUrl="",this._encodedUrlInternal=void 0,window.history.pushState({},"",window.location.pathname+"#preview"),this.requestUpdate();try{await this.previewService.handleFileUpload(t),this.uploadedFileName=t.name}catch(r){this.uploadError=r.message||String(r)}this.isUploading=!1,this.requestUpdate(),i.value=""}}clearUploadedContent(){this.previewService.clearUploadedContent(),this.uploadedFileName="",this.uploadError="",this.requestUpdate()}toggleScreenLock(){}render(){const e=this.previewService.getUploadedFileInfo().hasContent,i=this.isEncoded||e||this.uploadedFileName,t=!i;return U`
      <div class="preview-container">
        <div style="display: flex; align-items: center; gap: 1em;">
          <h2 style="margin: 0;">Playable Ad Preview</h2>
          ${this.isEncoded&&this.decodedUrl?U`
                <button
                  @click=${this.handleShare.bind(this)}
                  style="background: none; border: none; color: #1976d2; cursor: pointer; padding: 0; font: inherit; display: flex; align-items: center; gap: 0.5em; text-decoration: underline;"
                >
                  ${this.linkCopied?"Link copied":"Share"}
                </button>
              `:null}
          ${i?U`
                <button
                  @click=${()=>{this.previewService.clearUploadedContent(),this.uploadedFileName="",this.uploadError="",this.isEncoded=!1,this.decodedUrl="",this._encodedUrlInternal=void 0,window.history.pushState({},"",window.location.pathname+"#preview"),this.requestUpdate()}}
                  style="background: #ff6b6b; color: white; border: none; padding: 0.5em 1em; border-radius: 4px; cursor: pointer;"
                >
                  Load New Content
                </button>
              `:null}
        </div>
        
        ${t?U`
              <div style="margin: 1em 0; color: #555;">
                <p>
                  This page lets you preview playable ads from either a public GitHub repository or by uploading an HTML file directly.<br />
                </p>
                <p>
                  <b>Option 1:</b> Paste a GitHub URL below to preview and create shareable links.<br />
                  <b>Option 2:</b> Upload an HTML file from your computer for immediate preview.
                </p>
                <details style="margin-top: 1em;">
                  <summary style="cursor: pointer; font-weight: bold; color: #1976d2;">Show sample GitHub URL</summary>
                  <div style="margin: 0.5em 0 0 1em;">
                    <div style="display: flex; align-items: center; gap: 0.5em;">
                      <code style="background: #f5f5f5; padding: 0.2em 0.5em; border-radius: 4px; font-size: 0.95em;">https://github.com/gritsenko/playables/blob/main/Customize3d/index.html</code>
                      <button
                        style="background: #1976d2; color: #fff; border: none; border-radius: 4px; padding: 0.2em 0.8em; cursor: pointer; font-size: 0.95em;"
                        @click=${()=>{this.decodedUrl="https://github.com/gritsenko/playables/blob/main/Customize3d/index.html",this.handleLoad()}}
                      >
                        Try
                      </button>
                    </div>
                  </div>
                </details>
              </div>

              <!-- File Upload Section -->
              <div class="upload-section" style="margin-bottom: 1.5em; padding: 1em; border: 2px dashed #ddd; border-radius: 8px; background: #f9f9f9;">
                <h3 style="margin-top: 0; margin-bottom: 1em; color: #1976d2;">
                  📁 Upload HTML File
                </h3>
                
                <div style="display: flex; align-items: center; gap: 1em; margin-bottom: 1em;">
                  <input 
                    type="file" 
                    accept=".html,.htm" 
                    @change="${this.handleFileUpload}"
                    style="padding: 0.5em;"
                    ?disabled="${this.isUploading}"
                  />
                  
                  ${this.isUploading?U`
                    <div style="display: flex; align-items: center; gap: 0.5em; color: #1976d2;">
                      <div style="width: 16px; height: 16px; border: 2px solid #f3f3f3; border-top: 2px solid #1976d2; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                      <span>Uploading...</span>
                    </div>
                  `:""}
                </div>
                
                ${this.uploadError?U`
                  <div style="color: red; margin-bottom: 1em; padding: 0.5em; background: #ffe6e6; border-radius: 4px;">
                    ${this.uploadError}
                  </div>
                `:""}
                
                <div style="font-size: 0.9em; color: #666;">
                  <p style="margin: 0;">
                    • Supported formats: .html, .htm<br />
                    • Maximum file size: 10MB<br />
                    • Files are processed locally and not stored on our servers
                  </p>
                </div>
              </div>

              <!-- GitHub URL Section -->
              <div class="github-section" style="margin-bottom: 1.5em; padding: 1em; border: 2px dashed #ddd; border-radius: 8px; background: #f0f8ff;">
                <h3 style="margin-top: 0; margin-bottom: 1em; color: #1976d2;">
                  🔗 Load from GitHub
                </h3>
                
                <div class="preview-controls">
                  <input
                    type="text"
                    placeholder="Paste GitHub playable URL..."
                    .value=${this.decodedUrl}
                    @input=${this.handleInput.bind(this)}
                    style="width: 400px; padding: 0.5em;"
                  />
                  <button @click=${this.handleLoad.bind(this)} style="margin-left: 0.5em; padding: 0.5em 1em;">Load</button>
                </div>
              </div>

              ${this.recentUrls.length>0?U`
                    <div style="margin-bottom: 1.5em;">
                      <h3 style="margin-bottom: 0.5em; font-size: 1.1em; color: #1976d2;">Recent GitHub URLs</h3>
                      <div>
                        ${this.recentUrls.map(r=>U`
                            <div style="margin-bottom: 0.5em;">
                              <button
                                style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: #f5f5f5; color: #222; border: none; border-radius: 4px; padding: 0.4em 0.8em; font-size: 0.95em; cursor: pointer; text-align: left;"
                                @click=${()=>{this.decodedUrl=r,this.handleLoad()}}
                              >
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${r}</span>
                                <span style="margin-left: 1em; color: #1976d2; font-weight: bold;">Preview</span>
                              </button>
                            </div>
                          `)}
                      </div>
                    </div>
                  `:null}
            `:null}
          
        <div
          class="preview-frame"
          style="position: relative; display: flex; justify-content: center; align-items: center; min-height: 60vh;"
        >
          ${this.isEncoded&&this.decodedUrl?U`<playable-previewer
                githubUrl="${this.decodedUrl}"
              ></playable-previewer>`:e||this.uploadedFileName?U`<playable-previewer></playable-previewer>`:null}

          
        </div>

        
        <!-- CSS Animation for spinner -->
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `}};Tn([Mt(rr)],nr.prototype,"previewService",2);Tn([Eo("url")],nr.prototype,"encodedUrl",1);nr=Tn([we("preview-page"),Ke("/preview",{title:"Playable Ad Preview | PlayableTools",description:"Preview and share playable ads from GitHub on different devices and orientations."})],nr);const Gh="modulepreload",Wh=function(e){return"/PlayableTools/"+e},Fa={},Yh=function(i,t,r){let n=Promise.resolve();if(t&&t.length>0){let u=function(c){return Promise.all(c.map(h=>Promise.resolve(h).then(x=>({status:"fulfilled",value:x}),x=>({status:"rejected",reason:x}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=o?.nonce||o?.getAttribute("nonce");n=u(t.map(c=>{if(c=Wh(c),c in Fa)return;Fa[c]=!0;const h=c.endsWith(".css"),x=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${x}`))return;const y=document.createElement("link");if(y.rel=h?"stylesheet":Gh,h||(y.as="script"),y.crossOrigin="",y.href=c,l&&y.setAttribute("nonce",l),document.head.appendChild(y),h)return new Promise((v,E)=>{y.addEventListener("load",v),y.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${c}`)))})}))}function a(o){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=o,window.dispatchEvent(l),!l.defaultPrevented)throw o}return n.then(o=>{for(const l of o||[])l.status==="rejected"&&a(l.reason);return i().catch(a)})};class en{static getBaseDir(){const i=window.location.origin+window.location.pathname.replace(/([?#].*)$/,"");return i.endsWith("/")?i:i+"/"}static buildFetchUrl(i,t){return this.getBaseDir()+i+t}}class Kh{static extractScripts(i){if(!i)return{html:i,files:{}};const t={},r=[],n=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,a=i.replace(n,(x,y,v)=>{if(/\bsrc\s*=\s*["'][^"']+["']/i.test(y))return x;const E=/\btype\s*=\s*(['"])(.*?)\1/i.exec(y);return r.push({content:v,type:E?E[2]:void 0}),""});if(r.length===0)return{html:a,files:t};const o="script-1.js";let l="";for(const x of r)l+=x.content+`
`;t[o]=l;const c=r.some(x=>x.type&&x.type.toLowerCase()==="module")?' type="module"':"",h=`<script src="${o}"${c}><\/script>`;return/<\/body>/i.test(a)?{html:a.replace(/<\/body>/i,h+"</body>"),files:t}:{html:a+h,files:t}}}const Xh={replaceTokens:{'<script type="module" crossorigin>':"<script>"}},Jh=[{Name:"Facebook",InjeectScripts:["cta.Facebook.js"],replaceTokens:{XMLHttpRequest:"_xrq_"}},{Name:"Moloco",InjeectScripts:["cta.Moloco.js"],replaceTokens:{XMLHttpRequest:"_xrq_"}},{Name:"Facebook_Zip",format:"zip",OutputIndexHtmlName:"index.html",ExtractAssets:!0,ExtractScripts:!0,InjeectScripts:["cta.Facebook_Zip.js"],replaceTokens:{XMLHttpRequest:"_xrq_"}},{Name:"Mintegral",format:"zip",OutputIndexHtmlName:"%name%.html",InjeectScripts:["cta.Mintegral.js"]},{Name:"IronSource",InjeectScripts:["cta.IronSource.js"]},{Name:"AdColony",InjeectScripts:["cta.AdColony.js"]},{Name:"Unity",InjeectScripts:["cta.Unity.js"]},{Name:"Applovin",InjeectScripts:["cta.Applovin.js"]},{Name:"liftoff",InjeectScripts:["cta.Mraid2.js"]},{Name:"chartboost",InjeectScripts:["cta.Mraid2.js"]},{Name:"Vungle",OutputIndexHtmlName:"ad.html",format:"zip",ExtraFiles:[{from:"./Vungle/index.html",to:"./index.html"}],InjeectScripts:["cta.Vungle.js"]},{Name:"TikTok",format:"zip",OutputIndexHtmlName:"index.html",ExtraFiles:[{from:"./TikTok/config.json",to:"./config.json"}],InjeectScripts:["cta.TikTok.js"]},{Name:"Google",OutputIndexHtmlName:"index.html",format:"zip",Sizes:{"320x480":"width=320,height=480","480x320":"width=480,height=320","300x250":"width=300,height=250"},InjeectScripts:["cta.Google.js"],replaceTokens:{"</title>":'</title> <meta name="ad.size" content="{{ad.size}}"><meta name="ad.orientation" content="landscape">'}}],Qh={globalDefaults:Xh,platforms:Jh};var eu=Object.getOwnPropertyDescriptor,tu=(e,i,t,r)=>{for(var n=r>1?void 0:r?eu(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let tn=class{constructor(){this.config=[],this.globalDefaults={},this.loadConfig(Qh)}loadConfig(e){if(Array.isArray(e.platforms))this.config=e.platforms,e.globalDefaults&&typeof e.globalDefaults=="object"&&(this.globalDefaults=e.globalDefaults),console.log("PlayablePublishService: Loaded platforms config:",this.config);else throw new Error("Invalid config: platforms array missing")}getPlatforms(){return this.config}getAvailablePlatforms(){return this.config.map(e=>e.Name)}async processHtml(e,i,t){const r=this.config.find(u=>u.Name===i);if(!r)throw new Error(`Platform '${i}' not found in config`);let n=e;const a={};r.replaceTokens&&Object.assign(a,r.replaceTokens),t&&(t.googlePlayUrl&&(a["{{google}}"]=t.googlePlayUrl),t.appStoreUrl&&(a["{{apple}}"]=t.appStoreUrl));let o=performance.now();Object.keys(a).length>0&&(n=this.applyReplaceTokens(n,a));let l=performance.now();if(console.log(`[PlayablePublishService] Platform replaceTokens (${i}): ${(l-o).toFixed(2)} ms`),r.InjeectScripts&&Array.isArray(r.InjeectScripts)){let u=performance.now();n=await this.injectScripts(n,r.InjeectScripts,a);let c=performance.now();console.log(`[PlayablePublishService] Script injection (${i}): ${(c-u).toFixed(2)} ms`)}return r.OutputIndexHtmlName&&t?.name,n}applyReplaceTokens(e,i){if(!i||Object.keys(i).length===0)return e;const t=Object.keys(i),r=[];for(const l of t)try{const u=l.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&"),c=e.match(new RegExp(u,"g")),h=c?c.length:0;h>0&&r.push({token:l,count:h})}catch{}const n=t.map(l=>l.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),a=new RegExp(n.join("|"),"g"),o=e.replace(a,l=>i[l]??l);return r.length>0?console.log(`[PlayablePublishService] applyReplaceTokens: replaced ${r.length} token(s): ${r.map(l=>`${l.token}(${l.count})`).join(", ")}`):console.log("[PlayablePublishService] applyReplaceTokens: no tokens matched"),o}async injectScripts(e,i,t){let r=e;const n=i.map(async o=>{try{const l=en.buildFetchUrl("publish-data/",o),u=await fetch(l);if(u.ok){let c=await u.text();return t&&Object.keys(t).length>0&&(c=this.applyReplaceTokens(c,t)),`<script>
${c}
<\/script>`}else return console.warn(`Could not load script: ${o} from ${l}`),null}catch(l){return console.warn(`Failed to inject script ${o}:`,l),null}}),a=(await Promise.all(n)).filter(Boolean);for(const o of a)if(/<head[^>]*>/i.test(r)){const l=r.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);if(l){const u=l[2],c=u.match(/<script[^>]*>/i);if(c){const h=l.index+l[1].length+u.indexOf(c[0]);r=r.slice(0,h)+`
${o}
`+r.slice(h)}else r=r.replace(/<\/head>/i,`${o}
</head>`)}}else/<\/body>/i.test(r)?r=r.replace(/<\/body>/i,`${o}
</body>`):r=r+o;return r}async processAllPlatforms(e,i){if(!i.outputDirectory)throw new Error("Output directory is required");const t=i.name||"Playable",r=i.suffix||"EN";let n=e,a=performance.now();this.globalDefaults.replaceTokens&&(n=this.applyReplaceTokens(n,this.globalDefaults.replaceTokens));let o=performance.now();console.log(`[PlayablePublishService] Global replaceTokens: ${(o-a).toFixed(2)} ms`);let l=this.config;i.selectedPlatforms&&Array.isArray(i.selectedPlatforms)&&i.selectedPlatforms.length>0&&(l=this.config.filter(h=>i.selectedPlatforms.includes(h.Name)));const u=l.length;let c=0;for(const h of l){const x=await this.createPlatformDirectory(i.outputDirectory,h.Name),y=await this.processHtml(n,h.Name,i),v=this.generateFileName(t,h.Name,r,h,!0),H=this.generateFileName(t,h.Name,r,h,!1).replace(/\.html$/i,".zip");h.format==="zip"?await this.createZipPackageToDirectory(y,v,H,x,h):await this.saveHtmlFileToDirectory(y,v,x),c++;const M=30+c/u*70;i.onProgress?.(M,h.Name)}}generateFileName(e,i,t,r,n=!0){return n&&r.OutputIndexHtmlName?r.OutputIndexHtmlName.includes("%name%")?r.OutputIndexHtmlName.replace("%name%",e):r.OutputIndexHtmlName:`${e}_${i}_${t}.html`}async createPlatformDirectory(e,i){try{const t=await e.getDirectoryHandle(i,{create:!0});return console.log(`Created/accessed directory: ${i}`),t}catch(t){throw new Error(`Failed to create platform directory ${i}: ${t}`)}}async saveHtmlFileToDirectory(e,i,t){let r=performance.now();try{const o=await(await t.getFileHandle(i,{create:!0})).createWritable();await o.write(e),await o.close();const l=(e.length/1024).toFixed(2);console.log(`Saved HTML file: ${i} (${l} KB)`)}catch(a){throw new Error(`Failed to save HTML file ${i}: ${a}`)}let n=performance.now();console.log(`[PlayablePublishService] Save HTML (${i}): ${(n-r).toFixed(2)} ms`)}async createZipPackageToDirectory(e,i,t,r,n){try{const a=(await Yh(async()=>{const{default:O}=await import("./jszip.min-Bd8rc0nQ.js").then(q=>q.j);return{default:O}},[])).default,o=new a;if(n.ExtractScripts)try{const O=Kh.extractScripts(e);o.file(i,O.html);for(const[q,I]of Object.entries(O.files))o.file(q,I)}catch(O){console.warn(`ExtractScripts failed for platform ${n.Name}:`,O),o.file(i,e)}else o.file(i,e);if(n.ExtraFiles)for(const O of n.ExtraFiles)try{const q=`/publish-data/${O.from.replace("./","")}`,I=await fetch(q);if(I.ok){const P=await I.text();o.file(O.to.replace("./",""),P)}else console.warn(`Could not load extra file from: ${q}`)}catch(q){console.warn(`Could not load extra file: ${O.from}`,q)}let l=performance.now();const u=await o.generateAsync({type:"uint8array",compression:"DEFLATE",compressionOptions:{level:3}}),c=u.buffer.slice(u.byteOffset,u.byteOffset+u.byteLength),h=new Blob([c],{type:"application/zip"});let x=performance.now();console.log(`[PlayablePublishService] Zipping (${t}): ${(x-l).toFixed(2)} ms`);let y=performance.now();const E=await(await r.getFileHandle(t,{create:!0})).createWritable();await E.write(h),await E.close();let H=performance.now();console.log(`[PlayablePublishService] Save ZIP (${t}): ${(H-y).toFixed(2)} ms`);const M=(h.size/1024).toFixed(2);console.log(`Saved ZIP file: ${t} (${M} KB)`)}catch(a){throw new Error(`Failed to create ZIP package ${t}: ${a}`)}}async requestOutputDirectory(){if("showDirectoryPicker"in window)try{const e=await window.showDirectoryPicker();return console.log(`Selected output directory: ${e.name}`),e}catch(e){throw e instanceof Error&&e.name==="AbortError"?new Error("Directory selection was cancelled"):new Error(`Failed to select directory: ${e}`)}else throw new Error("File System Access API is not supported in this browser. Please use Chrome, Edge, or another supported browser.")}};tn=tu([vi(mt.Singleton)],tn);var iu=Object.defineProperty,ru=(e,i,t,r)=>{for(var n=void 0,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(i,t,n)||n);return n&&iu(i,t,n),n};class Ys extends ge{constructor(){super(...arguments),this.dragActive=!1,this.loadedFile=null,this.isPublishing=!1,this.publishProgress=0,this.currentPlatform=null,this.publishStartTime=null,this.publishElapsed=null,this.playableTitle="",this.googlePlayUrl="",this.appStoreUrl="",this.customSuffix="EN",this.outputDirectory="",this.availablePlatforms=[],this.selectedPlatforms=[],this.STORAGE_KEYS={playableTitle:"playable-publisher-title",googlePlayUrl:"playable-publisher-google-url",appStoreUrl:"playable-publisher-app-store-url",customSuffix:"playable-publisher-suffix",selectedPlatforms:"playable-publisher-selected-platforms"}}connectedCallback(){super.connectedCallback(),this.loadFromLocalStorage(),this.playablePublishService&&typeof this.playablePublishService.getAvailablePlatforms=="function"&&(this.availablePlatforms=this.playablePublishService.getAvailablePlatforms(),(!this.selectedPlatforms||this.selectedPlatforms.length===0)&&(this.selectedPlatforms=[...this.availablePlatforms]))}render(){return U`
      <div class="playable-publisher">
        <div style="margin-bottom:1.5rem">
          <strong>Publish Playable Ad</strong><br />
          <small>
            Use this tool to upload your playable ad HTML file and prepare it
            for different platforms.<br />
            Drop your .html file below or select it manually.
          </small>
        </div>

        ${this.loadedFile?U`
              <div class="file-loaded-info">
                <strong>File loaded:</strong> ${this.loadedFile.name}
                (${(this.loadedFile.size/1024).toFixed(2)} KB)

                ${this.isPublishing?U`
                      <div class="progress-container">
                        <div class="progress-text">
                          Publishing... ${Math.round(this.publishProgress)}%
                          ${this.currentPlatform?U`<span style="margin-left:1em;">(${this.currentPlatform})</span>`:""}
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
            `:U`
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
        ${this.loadedFile?U`
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
                @input=${i=>{this.updateField("playableTitle",i.target.value)}}
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
                @input=${i=>{this.updateField("googlePlayUrl",i.target.value)}}
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
                @input=${i=>{this.updateField("appStoreUrl",i.target.value)}}
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
                @input=${i=>{this.updateField("customSuffix",i.target.value)}}
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
                  ${this.availablePlatforms.map(i=>U`
                    <label class="platform-checkbox">
                      <input
                        type="checkbox"
                        .checked=${this.selectedPlatforms.includes(i)}
                        @change=${t=>this._onPlatformCheckboxChange(t,i)}
                      />
                      <span>${i}</span>
                    </label>
                  `)}
                </div>
              </div>
            </div>
          </div>
        `:null}

        <!-- Publish/Cancel buttons below the form -->
        <div style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem; justify-content: center;">
          ${this.loadedFile&&this.playableTitle&&!this.isPublishing?U`
            <button 
              @click=${this._publishPlayable}
              style="margin-right: 0.5rem;"
              ?disabled=${!this.selectedPlatforms.length}
            >
              Publish
            </button>
          `:null}
          ${this.loadedFile&&!this.isPublishing?U`
            <button 
              @click=${this._resetFile}
            >
              Cancel
            </button>
          `:null}
        </div>
      </div>
    `}_onPlatformCheckboxChange(i,t){i.target.checked?this.selectedPlatforms.includes(t)||(this.selectedPlatforms=[...this.selectedPlatforms,t]):this.selectedPlatforms=this.selectedPlatforms.filter(n=>n!==t),this.saveToLocalStorage(),this.requestUpdate()}_selectAllPlatforms(i){i.preventDefault(),this.selectedPlatforms=[...this.availablePlatforms],this.saveToLocalStorage(),this.requestUpdate()}_clearAllPlatforms(i){i.preventDefault(),this.selectedPlatforms=[],this.saveToLocalStorage(),this.requestUpdate()}_onDragOver(i){i.preventDefault(),this.dragActive=!0,this.requestUpdate()}_onDragLeave(i){i.preventDefault(),this.dragActive=!1,this.requestUpdate()}_onDrop(i){i.preventDefault(),this.dragActive=!1,this.requestUpdate();const t=i.dataTransfer?.files;t&&t.length&&this._processFile(t[0])}_onFileChange(i){const r=i.target.files?.[0];r&&this._processFile(r)}_processFile(i){if(i&&i.name.endsWith(".html")){this.loadedFile=i,this.requestUpdate();const t=new CustomEvent("file-selected",{detail:i});this.dispatchEvent(t)}else alert("Please select a valid .html file.")}_resetFile(){this.loadedFile=null,this.requestUpdate()}async _publishPlayable(){if(!this.loadedFile||!this.playableTitle){alert("Please provide a playable title and select a file.");return}if(!this.selectedPlatforms||this.selectedPlatforms.length===0){alert("Please select at least one platform to publish.");return}try{this.isPublishing=!0,this.publishProgress=0,this.currentPlatform=null,this.publishElapsed=null,this.requestUpdate(),this.publishProgress=10,this.requestUpdate();const i=await this.playablePublishService.requestOutputDirectory();this.publishStartTime=Date.now(),this.publishProgress=20,this.requestUpdate();const t=await this._readFileContent(this.loadedFile),r={name:this.playableTitle,title:this.playableTitle,googlePlayUrl:this.googlePlayUrl,appStoreUrl:this.appStoreUrl,suffix:this.customSuffix,outputDirectory:i,onProgress:(n,a)=>{this.publishProgress=n,a&&(this.currentPlatform=a),this.requestUpdate()},selectedPlatforms:[...this.selectedPlatforms]};if(this.publishProgress=30,this.requestUpdate(),await this.playablePublishService.processAllPlatforms(t,r),this.publishProgress=100,this.currentPlatform=null,this.publishStartTime){const n=Date.now()-this.publishStartTime;this.publishElapsed=this._formatElapsed(n)}this.requestUpdate(),setTimeout(()=>{let n="Publishing completed successfully! Files have been saved to the selected directory with subfolders for each platform.";this.publishElapsed&&(n+=`

Elapsed time: ${this.publishElapsed}`),alert(n),this.isPublishing=!1,this.publishProgress=0,this.publishElapsed=null,this.publishStartTime=null,this.requestUpdate()},500)}catch(i){console.error("Publishing failed:",i);let t=i instanceof Error?i.message:"Unknown error";t.includes("File System Access API is not supported")&&(t+=`

For best results, please use Chrome 86+, Edge 86+, or another browser that supports the File System Access API.`),alert(`Publishing failed: ${t}`),this.isPublishing=!1,this.publishProgress=0,this.requestUpdate()}}_formatElapsed(i){const t=Math.floor(i/1e3),r=Math.floor(t/60),n=t%60;return r>0?`${r}m ${n}s`:`${n}s`}_readFileContent(i){return new Promise((t,r)=>{const n=new FileReader;n.onload=a=>{const o=a.target?.result;typeof o=="string"?t(o):r(new Error("Failed to read file as text"))},n.onerror=()=>r(new Error("Failed to read file")),n.readAsText(i)})}loadFromLocalStorage(){this.playableTitle=localStorage.getItem(this.STORAGE_KEYS.playableTitle)||"",this.googlePlayUrl=localStorage.getItem(this.STORAGE_KEYS.googlePlayUrl)||"",this.appStoreUrl=localStorage.getItem(this.STORAGE_KEYS.appStoreUrl)||"",this.customSuffix=localStorage.getItem(this.STORAGE_KEYS.customSuffix)||"EN";const i=localStorage.getItem(this.STORAGE_KEYS.selectedPlatforms);if(i)try{const t=JSON.parse(i);Array.isArray(t)&&(this.selectedPlatforms=t)}catch{}this.requestUpdate()}saveToLocalStorage(){localStorage.setItem(this.STORAGE_KEYS.playableTitle,this.playableTitle),localStorage.setItem(this.STORAGE_KEYS.googlePlayUrl,this.googlePlayUrl),localStorage.setItem(this.STORAGE_KEYS.appStoreUrl,this.appStoreUrl),localStorage.setItem(this.STORAGE_KEYS.customSuffix,this.customSuffix),localStorage.setItem(this.STORAGE_KEYS.selectedPlatforms,JSON.stringify(this.selectedPlatforms))}updateField(i,t){switch(i){case"playableTitle":this.playableTitle=t;break;case"googlePlayUrl":this.googlePlayUrl=t;break;case"appStoreUrl":this.appStoreUrl=t;break;case"customSuffix":this.customSuffix=t;break}this.saveToLocalStorage(),this.requestUpdate()}}ru([Mt(tn)],Ys.prototype,"playablePublishService");customElements.define("playable-publisher",Ys);var nu=Object.getOwnPropertyDescriptor,au=(e,i,t,r)=>{for(var n=r>1?void 0:r?nu(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let Na=class extends ge{render(){return U`
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
    `}};Na=au([we("publish-page"),Ke("/publish",{title:"Publish Playable Ads",description:"Publish your playable ads to multiple ad networks with ease. This tool streamlines the process of deploying your ads."})],Na);var su=Object.getOwnPropertyDescriptor,ou=(e,i,t,r)=>{for(var n=r>1?void 0:r?su(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let Za=class extends ge{render(){return U`
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
    `}};Za=ou([we("validate-page"),Ke("/validate",{title:"Ad Network Technical Requirements",description:"A comprehensive guide to the technical requirements for major ad networks, including file size limits and validation tools."})],Za);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const lu=e=>e??pe;var cu=Object.getOwnPropertyDescriptor,du=(e,i,t,r)=>{for(var n=r>1?void 0:r?cu(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=o(n)||n);return n};let Ha=class extends ge{constructor(){super(...arguments),this.menuItems=[{label:"Home",path:"/",disabled:!1},{label:"CTA SDK",path:"/cta-sdk",disabled:!1},{label:"Publish",path:"/publish",disabled:!1},{label:"Validate",path:"/validate",disabled:!1},{label:"Compress assets",path:"/compress-assets",disabled:!1},{label:"Base64 Converter",path:"/base64",disabled:!1},{label:"Imba Packer",path:"/imba-packer",disabled:!1},{label:"Portfolio",path:"/portfolio",disabled:!1},{label:"Preview",path:"/preview",disabled:!1}],this.handleHashChange=()=>{this.requestUpdate()}}get currentPath(){let e=window.location.hash?window.location.hash.substring(1):"";return e.startsWith("/")||(e="/"+e),e}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.handleHashChange)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.handleHashChange)}render(){return U`
      <nav aria-label="Main menu">
        <ul>
          ${this.menuItems.map(e=>{const i=this.currentPath===e.path;return U`
              <li>
                <a
                  href=${lu(e.disabled?void 0:`#${e.path.substring(1)}`)}
                  class="${i?"active":""} ${e.disabled?"disabled":""}"
                  tabindex="${e.disabled?-1:0}"
                  aria-disabled="${e.disabled}"
                  title=${e.disabled?"Coming soon":""}
                  ...=${i?{"aria-current":"page"}:{}}
                  @click=${e.disabled?t=>t.preventDefault():void 0}
                >
                  ${e.label}
                </a>
              </li>
            `})}
        </ul>
      </nav>
    `}};Ha=du([we("nav-menu")],Ha);var hu=Object.defineProperty,uu=Object.getOwnPropertyDescriptor,Ks=(e,i,t,r)=>{for(var n=r>1?void 0:r?uu(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&hu(i,t,n),n};let rn=class extends ge{constructor(){super(...arguments),this.versionService=new fn}async connectedCallback(){super.connectedCallback(),await this.loadVersion()}async loadVersion(){try{await this.versionService.initialize();const e=this.versionService.getCurrentVersion();this.currentVersion=e?.version||""}catch(e){console.warn("Failed to load version in site logo:",e),this.currentVersion=""}}render(){return U`
      <a href="${en.getBaseDir()}" class="site-logo-link">
        <img
          src="${en.buildFetchUrl("","small-logo.jpg")}"
          alt="Logo"
          class="site-logo-img"
        />
        <span class="site-logo-title">
          <div class="site-logo-subheader">Gritsenko</div>
          Playable Ads Tools
          ${this.currentVersion?U`<div class="site-logo-version">v${this.currentVersion}</div>`:""}
        </span>
      </a>
    `}};Ks([$e()],rn.prototype,"currentVersion",2);rn=Ks([we("site-logo")],rn);var fu=Object.defineProperty,pu=Object.getOwnPropertyDescriptor,Rn=(e,i,t,r)=>{for(var n=r>1?void 0:r?pu(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&fu(i,t,n),n};let _i=class extends Co{constructor(){super(...arguments),this.sidebarOpen=!1,this.deferredPrompt=null}toggleSidebar(){this.sidebarOpen=!this.sidebarOpen}closeSidebar(){this.sidebarOpen=!1}connectedCallback(){super.connectedCallback(),window.addEventListener("beforeinstallprompt",e=>{const i=e;i.preventDefault(),this.deferredPrompt=i})}suggestPWAInstall(){this.deferredPrompt?(this.deferredPrompt.prompt(),this.deferredPrompt.userChoice.then(e=>{e.outcome==="accepted"?console.log("User accepted the install prompt"):console.log("User dismissed the install prompt"),this.deferredPrompt=null})):alert("The install prompt is not available. Please use the browser menu to install the app.")}render(){return U`
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
    `}};Rn([Ye({attribute:!1,type:Object})],_i.prototype,"body",2);Rn([Ye({type:Boolean})],_i.prototype,"sidebarOpen",2);_i=Rn([we("main-layout")],_i);var gu=Object.defineProperty,bu=Object.getOwnPropertyDescriptor,Xs=(e,i,t,r)=>{for(var n=r>1?void 0:r?bu(i,t):i,a=e.length-1,o;a>=0;a--)(o=e[a])&&(n=(r?o(i,t,n):o(n))||n);return r&&n&&gu(i,t,n),n};let nn=class extends ge{constructor(){super(...arguments),this.versionService=new fn,this.updateAvailable=!1}async connectedCallback(){super.connectedCallback(),console.log("🔧 Initializing PlayableTools..."),await this.initializeVersionService()}disconnectedCallback(){super.disconnectedCallback(),this.versionService.destroy()}async initializeVersionService(){try{await this.versionService.initialize();const e=this.versionService.getCurrentVersion();e&&(console.log(`🚀 Playable Ads Tools v${e.version}`),console.log(`📅 Build time: ${new Date(e.buildTime).toLocaleString()}`),console.log(`🔧 Build hash: ${e.hash}`),console.log(`${this.versionService.isPWAMode()?"📱 PWA Mode":"🌐 Browser Mode"}`)),this.versionService.onUpdateAvailable(i=>{this.updateAvailable=i,i&&(console.log("🔄 New version available!"),this.showUpdateNotification())})}catch(e){console.warn("Failed to initialize version service:",e)}}showUpdateNotification(){this.requestUpdate(),requestAnimationFrame(()=>{const e=this.querySelector("update-notification");e?.show&&e.show()})}async handleReloadRequested(){try{await this.versionService.reloadWithCacheClear()}catch(e){console.error("Failed to reload app:",e),window.location.reload()}}render(){return U`
      <router-outlet .defaultLayout="${_i}"></router-outlet>
      ${this.updateAvailable?U`
        <update-notification @reload-requested=${this.handleReloadRequested}></update-notification>
      `:""}
    `}};Xs([$e()],nn.prototype,"updateAvailable",2);nn=Xs([we("app-root")],nn);export{zn as c,_u as g};
