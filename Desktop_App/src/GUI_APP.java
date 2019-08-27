import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import com.panamahitek.ArduinoException;
import com.panamahitek.PanamaHitek_Arduino;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;
import sun.awt.image.ToolkitImage;

import static javax.swing.SwingUtilities.getRootPane;


import java.util.regex.Pattern;
import java.util.regex.Matcher;


public class GUI_APP {
    private JPanel panel1;
    private JTextField Texto;
    private JSlider slider1;
    private JButton button1;
    public JSlider slider2;
    public JSeparator separador;

    // Given a registry key, attempts to get the 'FriendlyName' value
// Returns null on failure.
//
    public static String getFriendlyName(String registryKey) {
        if (registryKey == null || registryKey.isEmpty()) {
            throw new IllegalArgumentException("'registryKey' null or empty");
        }
        try {
            int hkey = WinRegistry.HKEY_LOCAL_MACHINE;
            return WinRegistry.readString(hkey, registryKey, "FriendlyName");
        } catch (Exception ex) { // catch-all:
            // readString() throws IllegalArg, IllegalAccess, InvocationTarget
            System.err.println(ex.getMessage());
            return null;
        }
    }

    // Given a registry key, attempts to parse out the integer after
// substring "COM" in the 'FriendlyName' value; returns -1 on failure.
//
    public static int getComNumber(String registryKey) {
        String friendlyName = getFriendlyName(registryKey);

        if (friendlyName != null && friendlyName.indexOf("COM") >= 0) {
            String substr = friendlyName.substring(friendlyName.indexOf("COM"));
            Matcher matchInt = Pattern.compile("\\d+").matcher(substr);
            if (matchInt.find()) {
                return Integer.parseInt(matchInt.group());
            }
        }
        return -1;
    }

    PanamaHitek_Arduino arduino = new PanamaHitek_Arduino();
    SerialPortEventListener listener = new SerialPortEventListener() {
        @Override
                public void serialEvent(SerialPortEvent spe){
            try {
                if(arduino.isMessageAvailable()){
                    System.out.println(arduino.printMessage());
                }
            } catch (SerialPortException e) {
                e.printStackTrace();
            } catch (ArduinoException e) {
                e.printStackTrace();
            }
        }
    };


    public GUI_APP() {
        String keyPath = "SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_2341&PID_8036&MI_00\\";
        String device1 = "6&32cceb66&0&0000";

        System.out.println("First COM device: " + getComNumber(keyPath + device1));
        StringBuilder port = new StringBuilder();
        port.append("COM");
        port.append(getComNumber(keyPath + device1));
        // draw the major tick marks (one for every tick label)
        slider1.setMajorTickSpacing(1);
        // draw the tick marks
        slider1.setPaintTicks(true);
        // draw the tick mark labels
        slider1.setPaintLabels(true);
        // Set colors
        slider1.setForeground(Color.white);
        slider1.setBackground(new Color(38, 50, 56));

        // draw the major tick marks (one for every tick label)
        slider2.setMajorTickSpacing(1);
        // draw the tick marks
        slider2.setPaintTicks(true);
        // draw the tick mark labels
        slider2.setPaintLabels(true);
        // Set colors
        slider2.setForeground(Color.white);
        slider2.setBackground(new Color(38, 50, 56));


        try {
            arduino.arduinoRXTX(port.toString(), 9600, listener);
        } catch (ArduinoException e) {
            e.printStackTrace();
        }


        button1.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Enviar_mensaje(slider1.getValue(), slider2.getValue());
            }
        });
    }

    public void Enviar_mensaje(int slider_value, int slider_value2){
        String data = slider_value+"-"+slider_value2;
        try {
            arduino.sendData(data);
            System.out.println("Se envio al puerto serie: "+data);
        } catch (ArduinoException e) {
            e.printStackTrace();
        }catch(SerialPortException e){
            e.printStackTrace();
        }

    }




    public static void main(String[] args) {
        JFrame frame = new JFrame("Head-Mouse Software");
        frame.setContentPane(new GUI_APP().panel1);
        frame.setUndecorated(true);
        frame.setAlwaysOnTop(true);
        frame.pack();
        frame.setVisible(true);
    }

}
