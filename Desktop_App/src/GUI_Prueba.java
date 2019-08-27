import javax.swing.plaf.metal.*;
import javax.swing.event.*;
import javax.swing.plaf.*;
import java.awt.event.*;
import javax.swing.*;
import java.util.*;
import java.awt.*;

class Main extends JFrame {
    public Main() {
        getContentPane().setLayout(new FlowLayout());

        final JSlider slider = new JSlider(JSlider.HORIZONTAL, 0, 30, 15);
        // draw the major tick marks (one for every tick label)
        slider.setMajorTickSpacing(10);
        // draw the minor tick marks (between the tick labels)
        slider.setMinorTickSpacing(1);
        // draw the tick marks
        slider.setPaintTicks(true);
        // draw the tick mark labels
        slider.setPaintLabels(true);

        slider.setForeground(Color.red);
        slider.setBackground(Color.yellow);

        Dictionary dictionary = slider.getLabelTable();
        if (dictionary != null) {
            Enumeration keys = dictionary.keys();
            while (keys.hasMoreElements()) {
                JLabel label = (JLabel) dictionary.get(keys.nextElement());
                label.setForeground(Color.blue);
                // uncomment these following lines to get a background for your labels
                label.setOpaque(true);
                label.setBackground(Color.green);
            }
        }

        getContentPane().add(slider);

        addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent event) {
                System.exit(0);
            }
        });

        pack();
    }

    public static void main(String[] args) {
        (new Main()).show();
    }
}
