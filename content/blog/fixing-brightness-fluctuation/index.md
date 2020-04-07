---
title: "Fixing the brightness fluctuation problem on HP laptops with AMD graphics"
date: "2013-09-12"
---

After installing Windows 8 on my laptop for a second I decided not to install the AMD driver pack from HP website, since the driver that was installed by Windows Update worked perfectly and as you can imagine, I am not particularly fond of the oft-included management software that hogs system resources. Everything worked well until I discovered that when the computer is not plugged to the power, the screen brightness fluctuates widely - not following the ambient light as one would expect but according to the current content of the screen. Counterintuitively, the white windows in foreground made the screen turn brighter and vice versa, which made the problem even more visible.

I sifted through the power options (since this only happened when the computer was not plugged in), but I noted that the **Adaptive brightness** options were already disabled. I remembered having similar problems on my previous installation of Windows and as it turned out after a quick googling, this behaviour is caused by the ingenious feature of the AMD drivers, called **Vari-Bright™** which can be easily turned off using the **AMD's Catalyst Control Center**, which I chose not to install.

I figured that since the Catalyst Control Center is just a GUI frontend, the settings that are stored somewhere else, persumably in the registry. A bit of Google, a bit of trial and error and a couple restarts later, the brightness stayed constant.

I added a DWORD value **PP_VariBrightFeatureEnable** set to 0x00000000 to the following key: `HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000`

There is no need to install CCC just for this :)
