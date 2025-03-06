// frida -U -f co.feeld -l unpin.js

Java.perform(function() {
    var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
    var SSLContext = Java.use("javax.net.ssl.SSLContext");
    var TrustManager = Java.registerClass({ name: "co.yellw.yellowapp.TrustManager", implements: [X509TrustManager], methods: { checkClientTrusted: function(chain, authType) {}, checkServerTrusted: function(chain, authType) {}, getAcceptedIssuers: function() { return []; }, }, });
    var TrustManagers = [TrustManager.$new()];
    var SSLContextInit = SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom");
    var arrayList = Java.use("java.util.ArrayList");
    var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");

    TrustManagerImpl.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) { return arrayList.$new(); };
    TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) { return untrustedChain; };
    TrustManagerImpl.verifyChain.implementation = function(chain, authType, session, sslPolicy) { return chain };

    SSLContextInit.implementation = function(keyManager, trustManager, secureRandom) { SSLContextInit.call(this, keyManager, TrustManagers, secureRandom); };
});