##Fix compilation issue on android with fcm and background-geolocation plugins:

1. In the plugins/cordova-plugin-fcm/src/android/FCMPluginActivity.java:
Add the following at the beginning of the file
```
import com.google.firebase.FirebaseApp;
```
And the following in the beginning of the "onCreate" function (after the call to super)
```
FirebaseApp.initializeApp(this);
```

2. Remove and readd the android platform
```
ionic cordova platform remove android
ionic cordova platform add android
```

3. In the platforms/android/cordova-plugin-fcm/PathTime-FCMPlugin.gradle file, comment this line:
```
// apply plugin: com.google.gms.googleservices.GoogleServicesPlugin
```

4. In the platforms/android/project.properties file, replace the following:
```
cordova.system.library.3=com.google.firebase:firebase-core:+
cordova.system.library.4=com.google.firebase:firebase-messaging:+
cordova.system.library.5=com.google.android.gms:play-services-location:+
```
by
```
cordova.system.library.3=com.google.firebase:firebase-core:10.2.0
cordova.system.library.4=com.google.firebase:firebase-messaging:10.2.0
cordova.system.library.5=com.google.android.gms:play-services-location:10.2.0
```

5. In the platforms/android/res/values/string.xml file, add the following:
```
<string name="google_app_id" templateMergeStrategy="preserve" translatable="false">1:874360001878:android:47929d0c4659b454</string>
```
replace 1:874360001878:android:47929d0c4659b454 by the GOOGLE_APP_ID attribute from file config/GoogleService-Info-Dev.plist or config/GoogleService-Info-Release.plist (A script should be used...)


ADD THIS TOO: 
   <string name="fb_app_id">722785131195257</string>
    <string name="fb_app_name">@string/app_name</string>
  <string name="google_app_id" templateMergeStrategy="preserve" translatable="false">1:874360001878:android:47929d0c4659b454</string>
 
verifié types
npm install -g typescript@2.6.2

6. build
```
ionic cordova run android
```

##Deploy IOS Testing:
- run ionic build ios --prod --release
- Open Fabric and xcode
- Activate Push Notificaions in Xcode
- ADD this <key>NSPhotoLibraryUsageDescription</key>
    <string>$(PRODUCT_NAME) photos and video use.</string>
in plist file
- Add Marketting Icon in PathTime / Ressources / images.xcassets, scroll down and fill app store icon
- Run Archive command
- Distribute

##ADD IOS TESTERS:
- Add someone via https://fabric.io/moutot/ios/apps/fr.pathtime.pathtime/beta/releases/latest
- Once they accept you need to add them in your provisioning profile: You can get all the device ID when distributing a new version.
- Remove your old provisioning profile in terminal :
  - cd ~/Library/MobileDevice/Provisioning\ Profiles
  - rm -f *
- Double click on the new Provisioning profile that you just download.
- ReRun with Archive and all the users in pending should have access.


## Signer Android app:
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk Pathtime
mdp pathtime123

Puis celle ci 
~/Library/Android/sdk/build-tools/25.0.3/zipalign -v 4 platforms/android/build/outputs/apk/android-release-un
signed.apk android-release.apk

et upload l'app la dessus :
https://play.google.com/apps/publish/?hl=fr&account=8214899165915193034#ManageReleasesPlace:p=fr.pathtime.PathTime&appid=4974662581898325193
